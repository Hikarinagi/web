<script setup lang="ts">
  import { CalendarDays, Eye, FileText, Hash, Tag } from '@lucide/vue'
  import type { LightNovelVolumePageData } from '~~/server/api/pages/light-novel-volumes/[id].get'

  defineOptions({ name: 'LightNovelVolumeAboutArchive' })
  const props = defineProps<{
    volume: LightNovelVolumePageData['volume']
    contributors: LightNovelVolumePageData['contributors']
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
      <div v-if="volume.pages" class="flex items-center gap-2.5">
        <FileText class="size-3.5 shrink-0 text-surface-400" />
        <span class="text-surface-700 dark:text-surface-300">{{ volume.pages }} 页</span>
      </div>
      <div v-if="priceText" class="flex items-center gap-2.5">
        <Tag class="size-3.5 shrink-0 text-surface-400" />
        <span class="text-surface-700 dark:text-surface-300">{{ priceText }}</span>
      </div>
      <div v-if="volume.isbn" class="flex items-center gap-2.5">
        <Hash class="size-3.5 shrink-0 text-surface-400" />
        <span class="min-w-0 wrap-anywhere text-surface-700 dark:text-surface-300">
          {{ volume.isbn }}
        </span>
      </div>
      <div v-if="volume.read_times" class="flex items-center gap-2.5">
        <Eye class="size-3.5 shrink-0 text-surface-400" />
        <span class="text-surface-700 dark:text-surface-300">{{ volume.read_times }} 次阅读</span>
      </div>
    </div>

    <template #footer>
      <ResourceArchiveContributorFooter
        :contributors="contributors"
        resource-type="light-novel-volume"
        :resource-id="volume.id"
        :updated-at="volume.revised_at ?? volume.created_at"
      />
    </template>
  </ResourceArchiveCard>
</template>
