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
  import { dayText } from '~/features/entry/date'

  defineOptions({ name: 'LightNovelFacts' })
  const props = defineProps<{
    lightNovel: LightNovelPageData['light_novel']
    volumes: LightNovelPageData['volumes']
    people: LightNovelPageData['people']
    producers: LightNovelPageData['producers']
  }>()

  const COLLAPSED = 2
  const allAliases = ref(false)
  const aliases = computed(() =>
    allAliases.value
      ? props.lightNovel.other_names
      : props.lightNovel.other_names.slice(0, COLLAPSED),
  )
  const groups = computed(() => {
    const map = new Map<string, { id: number; name: string }[]>()
    for (const item of props.people) {
      const label = getLightNovelPersonRelationLabel(item.relation)
      map.set(label, [...(map.get(label) ?? []), item.person])
    }
    return [...map].map(([label, people]) => ({ label, people }))
  })
  const organizations = computed(() => {
    const map = new Map<string, { id: number; name: string; to: string }[]>()
    for (const item of props.producers) {
      const label = getLightNovelProducerRelationLabel(item.relation ?? 'other')
      const to =
        item.relation === 'bunko'
          ? `/light-novels/bunko/${item.producer.id}`
          : `/producers/${item.producer.id}`
      map.set(label, [...(map.get(label) ?? []), { ...item.producer, to }])
    }
    return [...map].map(([label, items]) => ({ label, items }))
  })
  const first = computed(() => props.volumes.find(volume => volume.publication_date))
  const last = computed(() => props.volumes.findLast(volume => volume.publication_date))
  const status = computed(() =>
    [
      props.lightNovel.novel_status ? getNovelStatusLabel(props.lightNovel.novel_status) : '',
      props.volumes.length ? `全 ${props.volumes.length} 卷` : '',
    ]
      .filter(Boolean)
      .join('，'),
  )
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
          <Link
            v-for="person in group.people"
            :key="person.id"
            :as="NuxtLink"
            :to="`/people/${person.id}`"
            tone="neutral"
            class="self-start"
            lang="ja"
          >
            {{ person.name }}
          </Link>
        </Stack>
      </DescriptionDetails>
    </template>
    <template v-for="group in organizations" :key="group.label">
      <DescriptionTerm>{{ group.label }}</DescriptionTerm>
      <DescriptionDetails>
        <Stack gap="none">
          <Link
            v-for="item in group.items"
            :key="item.id"
            :as="NuxtLink"
            :to="item.to"
            tone="neutral"
            class="self-start"
            lang="ja"
          >
            {{ item.name }}
          </Link>
        </Stack>
      </DescriptionDetails>
    </template>
    <template v-if="status">
      <DescriptionTerm>状态</DescriptionTerm>
      <DescriptionDetails>{{ status }}</DescriptionDetails>
    </template>
    <template v-if="first">
      <DescriptionTerm>首卷</DescriptionTerm>
      <DescriptionDetails class="tabular-nums">
        {{ dayText(first.publication_date) }}
      </DescriptionDetails>
    </template>
    <template v-if="last">
      <DescriptionTerm>最新卷</DescriptionTerm>
      <DescriptionDetails class="tabular-nums">
        {{ dayText(last.publication_date) }}
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
