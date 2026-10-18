<script setup lang="ts">
  import { Button, Inline, Link, Stack, Text } from '@hina-ui/vue'
  import { NuxtLink } from '#components'
  import {
    Barcode,
    BookMarked,
    BookOpen,
    Building2,
    CalendarDays,
    Globe,
    Layers,
    Newspaper,
    Tags,
  } from '@lucide/vue'
  import type { MangaPageData } from '~~/server/api/pages/mangas/[id].get'
  import { mangaSerialStatusLabel } from '~/features/manga/labels'

  defineOptions({ name: 'MangaAboutArchive' })

  const props = defineProps<{
    manga: MangaPageData['manga']
    producers: MangaPageData['producers']
    volumeCount: number
    contributors: MangaPageData['contributors']
  }>()

  const magazines = computed(() =>
    props.producers.filter(item => item.role === 'MAGAZINE').map(item => item.producer),
  )
  const publishers = computed(() =>
    props.producers.filter(item => item.role === 'PUBLISHER').map(item => item.producer),
  )
  const publishersOpen = ref(false)
  const publishersText = computed(() => {
    if (publishersOpen.value) return publishers.value.map(item => item.name).join(' / ')
    return publishers.value[0]?.name ?? ''
  })
  const publicationText = computed(() =>
    timeFormat(props.manga.publication_date, TimeFormatEnum.YYYY_MM_DD),
  )
  const publicationEndText = computed(() =>
    timeFormat(props.manga.publication_end_date, TimeFormatEnum.YYYY_MM_DD),
  )
  const homepageHost = computed(() => {
    if (!props.manga.homepage) return ''
    try {
      return new URL(props.manga.homepage).host
    } catch {
      return ''
    }
  })
  const bookFacts = computed(() =>
    [
      props.manga.pages ? `${props.manga.pages} 页` : '',
      props.manga.price_amount
        ? `${props.manga.price_currency ?? ''} ${props.manga.price_amount}`.trim()
        : '',
    ]
      .filter(Boolean)
      .join(' · '),
  )
  const aliasesText = computed(() => props.manga.other_names.join(' / '))
  const bangumiUrl = computed(() =>
    props.manga.bangumi_subject_id
      ? `https://bangumi.tv/subject/${props.manga.bangumi_subject_id}`
      : null,
  )
</script>

<template>
  <ResourceArchiveCard>
    <Stack gap="sm" class="px-5 py-3.5">
      <ResourceArchiveRow :icon="BookMarked">
        {{ mangaSerialStatusLabel(manga.serial_status) }}
      </ResourceArchiveRow>

      <ResourceArchiveRow
        v-if="publicationText"
        :icon="CalendarDays"
        :label="publicationEndText ? '连载期间' : '开始连载'"
      >
        {{ publicationText }}
        <template v-if="publicationEndText">~ {{ publicationEndText }}</template>
      </ResourceArchiveRow>

      <ResourceArchiveRow v-if="magazines.length" :icon="Newspaper" label="连载杂志">
        <template v-for="(magazine, index) in magazines" :key="magazine.id">
          <Text v-if="index > 0" as="span" size="sm" tone="faint">/</Text>
          <Link :as="NuxtLink" :to="`/mangas/magazine/${magazine.id}`">{{ magazine.name }}</Link>
        </template>
      </ResourceArchiveRow>

      <ResourceArchiveRow v-if="publishers.length" :icon="Building2" align="start" label="出版社">
        <Stack gap="none" align="start">
          <Text as="span" size="sm">{{ publishersText }}</Text>
          <Button
            v-if="publishers.length > 1"
            variant="link"
            size="sm"
            class="px-0"
            @click="publishersOpen = !publishersOpen"
          >
            {{ publishersOpen ? '收起' : `其他出版社 ${publishers.length - 1} 家` }}
          </Button>
        </Stack>
      </ResourceArchiveRow>

      <ResourceArchiveRow v-if="volumeCount" :icon="Layers"
        >单行本 {{ volumeCount }} 卷</ResourceArchiveRow
      >
      <ResourceArchiveRow v-if="bookFacts" :icon="BookOpen">{{ bookFacts }}</ResourceArchiveRow>
      <ResourceArchiveRow v-if="manga.isbn" :icon="Barcode" label="ISBN">{{
        manga.isbn
      }}</ResourceArchiveRow>

      <ResourceArchiveRow v-if="homepageHost" :icon="Globe">
        <Link
          as="a"
          :href="manga.homepage!"
          target="_blank"
          rel="noopener noreferrer"
          class="truncate"
        >
          {{ homepageHost }}
        </Link>
      </ResourceArchiveRow>

      <ResourceArchiveRow v-if="manga.other_names.length" :icon="Tags" align="start">
        {{ aliasesText }}
      </ResourceArchiveRow>

      <MangaEditionList v-if="manga.editions?.length" :editions="manga.editions" />
    </Stack>

    <Inline v-if="bangumiUrl" gap="sm" class="px-5 pb-4">
      <ResourceArchiveExternalChip :href="bangumiUrl">Bangumi</ResourceArchiveExternalChip>
    </Inline>

    <template #footer>
      <ResourceArchiveContributorFooter
        :contributors="contributors"
        resource-type="manga"
        :resource-id="manga.id"
        :updated-at="manga.revised_at ?? manga.created_at"
      />
    </template>
  </ResourceArchiveCard>
</template>
