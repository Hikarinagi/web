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
  import type { MangaPageData } from '~~/server/api/pages/mangas/[id].get'
  import { dateText } from '~/features/entry/date'
  import { creditRoleLabel } from '~/features/entry/labels'
  import { MANGA_AUDIENCE_LABELS, MANGA_READING_MODE_LABELS } from '~/features/manga/labels'

  defineOptions({ name: 'MangaFacts' })
  const props = defineProps<{
    manga: MangaPageData['manga']
    people: MangaPageData['people']
    producers: MangaPageData['producers']
    volumes: MangaPageData['volumes']
    sets: MangaPageData['sets']
  }>()

  const { t } = useLocaleText()
  const ORGANIZATION_ROLES = ['PUBLISHER', 'CHINESE_PUBLISHER', 'MAGAZINE', 'LABEL']
  const COLLAPSED = 3
  const allAliases = ref(false)
  const aliases = computed(() =>
    allAliases.value ? props.manga.other_names : props.manga.other_names.slice(0, COLLAPSED),
  )
  const named = (code: string) =>
    props.manga.credit_names
      .filter(item => item.code === code)
      .map(item => ({ id: null, name: item.name }))
  const groups = computed(() => {
    const map = new Map<string, { id: number | null; name: string }[]>()
    for (const item of props.people) {
      const label = item.note || creditRoleLabel(item.code)
      map.set(label, [...(map.get(label) ?? []), item.person])
    }
    for (const item of props.manga.credit_names) {
      if (ORGANIZATION_ROLES.includes(item.code)) continue
      const label = creditRoleLabel(item.code)
      map.set(label, [...(map.get(label) ?? []), { id: null, name: item.name }])
    }
    return [...map].map(([label, people]) => ({ label, people }))
  })
  const organizations = (code: string) => [
    ...props.producers
      .filter(item => item.code === code)
      .map(item => ({ id: item.producer.id as number | null, name: item.producer.name })),
    ...named(code),
  ]
  const magazines = computed(() => organizations('MAGAZINE'))
  const publishers = computed(() =>
    [
      { label: t('book.facts.publisher'), items: organizations('PUBLISHER') },
      { label: creditRoleLabel('CHINESE_PUBLISHER'), items: organizations('CHINESE_PUBLISHER') },
    ].filter(group => group.items.length),
  )
  const status = computed(() => {
    const code = props.manga.publication_status
    return code === 'ONGOING' || code === 'COMPLETED' || code === 'HIATUS'
      ? t(`book.status.${code}`)
      : null
  })
  const book = computed(() =>
    [
      props.manga.pages ? `${props.manga.pages} 页` : '',
      props.manga.price_amount
        ? `${props.manga.price_currency ?? ''} ${props.manga.price_amount}`.trim()
        : '',
    ]
      .filter(Boolean)
      .join('，'),
  )
  const host = computed(() =>
    props.manga.homepage?.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, ''),
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
    <template v-if="magazines.length">
      <DescriptionTerm>连载</DescriptionTerm>
      <DescriptionDetails>
        <Stack gap="none">
          <template v-for="magazine in magazines" :key="magazine.id ?? magazine.name">
            <Link
              v-if="magazine.id !== null"
              :as="NuxtLink"
              :to="`/mangas/magazine/${magazine.id}`"
              tone="neutral"
              class="self-start"
              lang="ja"
            >
              {{ magazine.name }}
            </Link>
            <Text v-else as="span" size="sm" lang="ja">{{ magazine.name }}</Text>
          </template>
        </Stack>
      </DescriptionDetails>
    </template>
    <template v-for="group in publishers" :key="group.label">
      <DescriptionTerm>{{ group.label }}</DescriptionTerm>
      <DescriptionDetails>
        <Stack gap="none">
          <template v-for="item in group.items" :key="item.id ?? item.name">
            <Link
              v-if="item.id !== null"
              :as="NuxtLink"
              :to="`/producers/${item.id}`"
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
    <template v-if="manga.publication_date">
      <DescriptionTerm>{{ t('book.facts.firstVolume') }}</DescriptionTerm>
      <DescriptionDetails class="tabular-nums">
        {{ dateText(manga.publication_date, manga.publication_date_precision) }}
      </DescriptionDetails>
    </template>
    <template v-if="status">
      <DescriptionTerm>{{ t('book.facts.status') }}</DescriptionTerm>
      <DescriptionDetails>{{ status }}</DescriptionDetails>
    </template>
    <template v-if="volumes.length || sets.length > 1">
      <DescriptionTerm>单行本</DescriptionTerm>
      <DescriptionDetails>
        <MangaFactsVolumes :volumes="volumes" :sets="sets" />
      </DescriptionDetails>
    </template>
    <template v-if="book">
      <DescriptionTerm>单册</DescriptionTerm>
      <DescriptionDetails>{{ book }}</DescriptionDetails>
    </template>
    <template v-if="manga.isbn">
      <DescriptionTerm>ISBN</DescriptionTerm>
      <DescriptionDetails class="tabular-nums">{{ manga.isbn }}</DescriptionDetails>
    </template>
    <template v-if="manga.audience">
      <DescriptionTerm>读者对象</DescriptionTerm>
      <DescriptionDetails>{{ MANGA_AUDIENCE_LABELS[manga.audience] }}</DescriptionDetails>
    </template>
    <template v-if="manga.reading_mode">
      <DescriptionTerm>阅读方向</DescriptionTerm>
      <DescriptionDetails>{{ MANGA_READING_MODE_LABELS[manga.reading_mode] }}</DescriptionDetails>
    </template>
    <template v-if="manga.homepage">
      <DescriptionTerm>官网</DescriptionTerm>
      <DescriptionDetails class="min-w-0">
        <Link
          as="a"
          :href="manga.homepage"
          target="_blank"
          rel="noopener noreferrer"
          tone="neutral"
          class="block truncate"
        >
          {{ host }}
        </Link>
      </DescriptionDetails>
    </template>
    <template v-if="manga.other_names.length">
      <DescriptionTerm>别名</DescriptionTerm>
      <DescriptionDetails class="wrap-anywhere">
        <Stack gap="none">
          <Text v-for="alias in aliases" :key="alias" as="span" size="sm">{{ alias }}</Text>
          <HnButton
            v-if="manga.other_names.length > COLLAPSED"
            variant="link"
            size="sm"
            class="self-start"
            @click="allAliases = !allAliases"
          >
            {{ allAliases ? '收起' : `另有 ${manga.other_names.length - COLLAPSED} 个` }}
          </HnButton>
        </Stack>
      </DescriptionDetails>
    </template>
  </DescriptionList>
</template>
