<script setup lang="ts">
  import { SegmentedControl } from '@hina-ui/vue'
  import type { MangaPageData } from '~~/server/api/pages/mangas/[id].get'
  import type { DownloadFormat } from '~/features/download/types'
  import { useDownloadDialog } from '~/features/download/useDownloadDialog'
  import { useSelection } from '~/features/download/useSelection'
  import { MANGA_READING_UNIT_NOUN, mangaChapterLabel, mangaReadingUnit } from '@hikarinagi/shared'

  defineOptions({ name: 'MangaDownloadAction' })

  const props = defineProps<{ id: number; title: string; chapters: MangaPageData['chapters'] }>()
  const FORMAT_OPTIONS = [
    { value: 'CBZ', label: 'CBZ' },
    { value: 'EPUB', label: 'EPUB' },
  ]
  const format = ref<DownloadFormat>('CBZ')
  const chapters = computed(() => props.chapters.filter(chapter => chapter.readable))
  const options = computed(() =>
    chapters.value.map(chapter => ({ id: chapter.id, label: mangaChapterLabel(chapter) })),
  )
  const unit = computed(() => {
    const units = new Set(chapters.value.map(chapter => mangaReadingUnit(chapter.chapter_type)))
    return units.size === 1 ? MANGA_READING_UNIT_NOUN[[...units][0]!] : '项'
  })
  const flow = useDownloadDialog({ kind: 'MANGA', seriesId: () => props.id, format })
  watch(
    chapters,
    value => {
      flow.selected.value = value.map(chapter => chapter.id)
    },
    { immediate: true },
  )
  const selection = useSelection(() => options.value, flow.selected)
  const locked = computed(() => flow.creating.value || !!flow.run.value)
</script>

<template>
  <DownloadTrigger
    v-if="chapters.length"
    :loading="flow.creating.value"
    @click="flow.open.value = true"
  />
  <DownloadDialog :flow="flow" :title="title" :unit="unit">
    <DownloadSelection
      v-model="flow.selected.value"
      :selection="selection"
      :unit="unit"
      :disabled="locked"
    >
      <template #toolbar>
        <SegmentedControl
          v-model="format"
          :options="FORMAT_OPTIONS"
          size="sm"
          :disabled="locked"
          aria-label="文件格式"
        />
      </template>
    </DownloadSelection>
  </DownloadDialog>
</template>
