<script setup lang="ts">
  import { Barcode, BookOpen, Building2, CalendarDays, ListOrdered, Tag } from '@lucide/vue'
  import type { MangaVolumePageData } from '~~/server/api/pages/manga-volumes/[id].get'

  defineOptions({ name: 'MangaVolumeAboutArchive' })
  const props = defineProps<{
    volume: MangaVolumePageData['volume']
    contributors: MangaVolumePageData['contributors']
  }>()

  const publicationText = computed(
    () => timeFormat(props.volume.publication_date, TimeFormatEnum.YYYY_MM_DD) || '未收录',
  )
  const priceText = computed(() =>
    props.volume.price_amount != null
      ? [props.volume.price_currency, props.volume.price_amount].filter(Boolean).join(' ')
      : '',
  )
</script>

<template>
  <ResourceArchiveCard>
    <div class="flex flex-col gap-2.5 px-5 py-3.5 text-[13px]">
      <div class="flex items-center gap-2.5">
        <CalendarDays class="size-3.5 shrink-0 text-surface-400" />
        <span class="text-surface-700 dark:text-surface-300">{{ publicationText }}</span>
      </div>
      <div v-if="volume.page_count" class="flex items-center gap-2.5">
        <BookOpen class="size-3.5 shrink-0 text-surface-400" />
        <span class="text-surface-700 dark:text-surface-300">{{ volume.page_count }} 页</span>
      </div>
      <div v-if="volume.chapter_count" class="flex items-center gap-2.5">
        <ListOrdered class="size-3.5 shrink-0 text-surface-400" />
        <span class="text-surface-700 dark:text-surface-300">
          收录 {{ volume.chapter_count }} 话
        </span>
      </div>
      <div v-if="volume.publisher" class="flex items-center gap-2.5">
        <Building2 class="size-3.5 shrink-0 text-surface-400" />
        <span class="wrap-anywhere text-surface-700 dark:text-surface-300">
          {{ volume.publisher }}
        </span>
      </div>
      <div v-if="priceText" class="flex items-center gap-2.5">
        <Tag class="size-3.5 shrink-0 text-surface-400" />
        <span class="text-surface-700 dark:text-surface-300">{{ priceText }}</span>
      </div>
      <div v-if="volume.isbn" class="flex items-center gap-2.5">
        <Barcode class="size-3.5 shrink-0 text-surface-400" />
        <span class="min-w-0 wrap-anywhere text-surface-700 dark:text-surface-300">
          {{ volume.isbn }}
        </span>
      </div>
      <MangaEditionList v-if="volume.editions?.length" :editions="volume.editions" />
    </div>

    <template #footer>
      <ResourceArchiveContributorFooter
        :contributors="contributors"
        resource-type="manga-volume"
        :resource-id="volume.id"
        :updated-at="volume.revised_at ?? volume.created_at"
      />
    </template>
  </ResourceArchiveCard>
</template>
