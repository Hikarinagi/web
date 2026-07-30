<script setup lang="ts">
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
    <div class="flex flex-col gap-2.5 px-5 py-3.5 text-[13px]">
      <div class="flex items-center gap-2.5">
        <BookMarked class="size-3.5 shrink-0 text-surface-400" />
        <span class="text-surface-700 dark:text-surface-300">
          {{ mangaSerialStatusLabel(manga.serial_status) }}
        </span>
      </div>
      <div v-if="publicationText" class="flex items-center gap-2.5">
        <CalendarDays class="size-3.5 shrink-0 text-surface-400" />
        <span class="flex min-w-0 items-center gap-1.5">
          <span class="shrink-0 text-xs text-surface-400">
            {{ publicationEndText ? '连载期间' : '开始连载' }}
          </span>
          <span class="text-surface-700 dark:text-surface-300">
            {{ publicationText }}
            <template v-if="publicationEndText">~ {{ publicationEndText }}</template>
          </span>
        </span>
      </div>
      <div v-if="magazines.length" class="flex items-center gap-2.5">
        <Newspaper class="size-3.5 shrink-0 text-surface-400" />
        <span class="flex min-w-0 items-center gap-1.5">
          <span class="shrink-0 text-xs text-surface-400">连载杂志</span>
          <span class="min-w-0 wrap-anywhere text-surface-700 dark:text-surface-300">
            <template v-for="(magazine, index) in magazines" :key="magazine.id">
              <span v-if="index > 0">/</span>
              <NuxtLink
                :to="`/mangas/magazine/${magazine.id}`"
                class="transition-colors hover:text-hikari-primary-600 dark:hover:text-hikari-primary-400"
              >
                {{ magazine.name }}
              </NuxtLink>
            </template>
          </span>
        </span>
      </div>
      <div v-if="publishers.length" class="flex items-start gap-2.5">
        <Building2 class="mt-0.5 size-3.5 shrink-0 text-surface-400" />
        <span class="flex min-w-0 flex-col gap-0.5">
          <span class="flex min-w-0 items-center gap-1.5">
            <span class="shrink-0 text-xs text-surface-400">出版社</span>
            <span class="min-w-0 wrap-anywhere text-surface-700 dark:text-surface-300">
              {{ publishersText }}
            </span>
          </span>
          <Button
            v-if="publishers.length > 1"
            unstyled
            class="w-fit text-xs text-hikari-primary-600 transition-colors hover:text-hikari-primary-700 dark:text-hikari-primary-400"
            @click="publishersOpen = !publishersOpen"
          >
            {{ publishersOpen ? '收起' : `其他出版社 ${publishers.length - 1} 家` }}
          </Button>
        </span>
      </div>
      <div v-if="volumeCount" class="flex items-center gap-2.5">
        <Layers class="size-3.5 shrink-0 text-surface-400" />
        <span class="text-surface-700 dark:text-surface-300">单行本 {{ volumeCount }} 卷</span>
      </div>
      <div v-if="bookFacts" class="flex items-center gap-2.5">
        <BookOpen class="size-3.5 shrink-0 text-surface-400" />
        <span class="text-surface-700 dark:text-surface-300">{{ bookFacts }}</span>
      </div>
      <div v-if="manga.isbn" class="flex items-center gap-2.5">
        <Barcode class="size-3.5 shrink-0 text-surface-400" />
        <span class="flex min-w-0 items-center gap-1.5">
          <span class="shrink-0 text-xs text-surface-400">ISBN</span>
          <span class="wrap-anywhere text-surface-700 dark:text-surface-300">{{ manga.isbn }}</span>
        </span>
      </div>
      <div v-if="homepageHost" class="flex items-center gap-2.5">
        <Globe class="size-3.5 shrink-0 text-surface-400" />
        <a
          :href="manga.homepage!"
          target="_blank"
          rel="noopener noreferrer"
          class="min-w-0 truncate text-surface-700 transition-colors hover:text-hikari-primary-600 dark:text-surface-300 dark:hover:text-hikari-primary-400"
        >
          {{ homepageHost }}
        </a>
      </div>
      <div v-if="manga.other_names.length" class="flex items-start gap-2.5">
        <Tags class="mt-0.5 size-3.5 shrink-0 text-surface-400" />
        <span class="min-w-0 wrap-anywhere text-surface-600 dark:text-surface-400">
          {{ aliasesText }}
        </span>
      </div>
      <MangaEditionList v-if="manga.editions?.length" :editions="manga.editions" />
    </div>

    <div v-if="bangumiUrl" class="flex gap-2 px-5 pb-4">
      <a
        :href="bangumiUrl"
        target="_blank"
        rel="noopener noreferrer"
        class="rounded-md border border-surface-200 px-2.5 py-1 text-[11px] font-semibold text-surface-600 transition-colors hover:bg-surface-50 dark:border-surface-700 dark:text-surface-300 dark:hover:bg-surface-800"
      >
        Bangumi
      </a>
    </div>

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
