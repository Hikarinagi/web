<script setup lang="ts">
  import {
    Button as HnButton,
    DescriptionDetails,
    DescriptionList,
    DescriptionTerm,
    Link,
    Stack,
    Text,
  } from '@hina-ui/vue'
  import { NuxtLink } from '#components'
  import type { LightNovelPageData } from '~~/server/api/pages/light-novels/[id].get'
  import { dateText } from '~/features/entry/date'
  import { creditRoleLabel } from '~/features/entry/labels'

  defineOptions({ name: 'LightNovelFacts' })
  const props = defineProps<{
    lightNovel: LightNovelPageData['light_novel']
    volumes: LightNovelPageData['volumes']
    sets: LightNovelPageData['sets']
    people: LightNovelPageData['people']
    producers: LightNovelPageData['producers']
  }>()

  const { t } = useLocaleText()
  const ORGANIZATION_ROLES = ['PUBLISHER', 'CHINESE_PUBLISHER', 'LABEL', 'MAGAZINE']
  const COLLAPSED = 2
  const allAliases = ref(false)
  const aliases = computed(() =>
    allAliases.value
      ? props.lightNovel.other_names
      : props.lightNovel.other_names.slice(0, COLLAPSED),
  )
  const roleLabel = (code: string) =>
    code === 'PUBLISHER' ? t('book.facts.publisher') : creditRoleLabel(code)
  const groups = computed(() => {
    const map = new Map<string, { id: number | null; name: string }[]>()
    for (const item of props.people) {
      const label = roleLabel(item.code)
      map.set(label, [...(map.get(label) ?? []), item.person])
    }
    for (const item of props.lightNovel.credit_names) {
      if (ORGANIZATION_ROLES.includes(item.code)) continue
      const label = roleLabel(item.code)
      map.set(label, [...(map.get(label) ?? []), { id: null, name: item.name }])
    }
    return [...map].map(([label, people]) => ({ label, people }))
  })
  const organizations = computed(() => {
    const map = new Map<string, { id: number | null; name: string; to: string | null }[]>()
    for (const item of props.producers) {
      const label = roleLabel(item.code)
      const to =
        item.code === 'LABEL'
          ? `/light-novels/bunko/${item.producer.id}`
          : `/producers/${item.producer.id}`
      map.set(label, [...(map.get(label) ?? []), { ...item.producer, to }])
    }
    for (const item of props.lightNovel.credit_names) {
      if (!ORGANIZATION_ROLES.includes(item.code)) continue
      const label = roleLabel(item.code)
      map.set(label, [...(map.get(label) ?? []), { id: null, name: item.name, to: null }])
    }
    return [...map].map(([label, items]) => ({ label, items }))
  })
  const several = computed(() => props.sets.length > 1)
  const first = computed(() =>
    several.value ? undefined : props.volumes.find(volume => volume.publication_date),
  )
  const last = computed(() =>
    several.value ? undefined : props.volumes.findLast(volume => volume.publication_date),
  )
  const status = computed(() => {
    const code = props.lightNovel.publication_status
    return [
      code === 'ONGOING' || code === 'COMPLETED' || code === 'HIATUS'
        ? t(`book.status.${code}`)
        : '',
      props.volumes.length && !several.value ? `全 ${props.volumes.length} 卷` : '',
    ]
      .filter(Boolean)
      .join('，')
  })
</script>

<template>
  <DescriptionList
    orientation="horizontal"
    class="gap-x-4 gap-y-2 text-sm [&_dd]:text-fg [&_dt]:text-muted"
  >
    <template v-for="group in groups" :key="group.label">
      <DescriptionTerm>{{ group.label }}</DescriptionTerm>
      <DescriptionDetails>
        <Stack gap="none">
          <template v-for="person in group.people" :key="person.id ?? person.name">
            <Link
              v-if="person.id !== null"
              :as="NuxtLink"
              :to="`/people/${person.id}`"
              tone="neutral"
              class="self-start"
              lang="ja"
            >
              {{ person.name }}
            </Link>
            <Text v-else as="span" size="sm" lang="ja">{{ person.name }}</Text>
          </template>
        </Stack>
      </DescriptionDetails>
    </template>
    <template v-for="group in organizations" :key="group.label">
      <DescriptionTerm>{{ group.label }}</DescriptionTerm>
      <DescriptionDetails>
        <Stack gap="none">
          <template v-for="item in group.items" :key="item.id ?? item.name">
            <Link
              v-if="item.to"
              :as="NuxtLink"
              :to="item.to"
              tone="neutral"
              class="self-start"
              lang="ja"
            >
              {{ item.name }}
            </Link>
            <Text v-else as="span" size="sm" lang="ja">{{ item.name }}</Text>
          </template>
        </Stack>
      </DescriptionDetails>
    </template>
    <template v-if="status">
      <DescriptionTerm>{{ t('book.facts.status') }}</DescriptionTerm>
      <DescriptionDetails>{{ status }}</DescriptionDetails>
    </template>
    <template v-if="several">
      <DescriptionTerm>单行本</DescriptionTerm>
      <DescriptionDetails>
        <LightNovelFactsVolumes :sets="sets" />
      </DescriptionDetails>
    </template>
    <template v-if="first">
      <DescriptionTerm>首卷</DescriptionTerm>
      <DescriptionDetails class="tabular-nums">
        {{ dateText(first.publication_date, first.publication_date_precision) }}
      </DescriptionDetails>
    </template>
    <template v-if="last">
      <DescriptionTerm>最新卷</DescriptionTerm>
      <DescriptionDetails class="tabular-nums">
        {{ dateText(last.publication_date, last.publication_date_precision) }}
      </DescriptionDetails>
    </template>
    <template v-if="lightNovel.read_times">
      <DescriptionTerm>阅读</DescriptionTerm>
      <DescriptionDetails class="tabular-nums">{{ lightNovel.read_times }} 次</DescriptionDetails>
    </template>
    <template v-if="lightNovel.other_names.length">
      <DescriptionTerm>别名</DescriptionTerm>
      <DescriptionDetails class="wrap-anywhere">
        <Stack gap="none">
          <Text v-for="alias in aliases" :key="alias" as="span" size="sm">{{ alias }}</Text>
          <HnButton
            v-if="lightNovel.other_names.length > COLLAPSED"
            variant="link"
            size="sm"
            class="self-start"
            @click="allAliases = !allAliases"
          >
            {{ allAliases ? '收起' : `另有 ${lightNovel.other_names.length - COLLAPSED} 个` }}
          </HnButton>
        </Stack>
      </DescriptionDetails>
    </template>
  </DescriptionList>
</template>
