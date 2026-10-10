<script setup lang="ts">
  import { SegmentedControl } from '@hina-ui/vue'
  import type { MangaPageData } from '~~/server/api/pages/mangas/[id].get'
  import type { DownloadFormat } from '~/features/download/types'
  import { useDownloadDialog } from '~/features/download/useDownloadDialog'
  import { useSelection } from '~/features/download/useSelection'
  import { getMangaEpisodeLabel } from '~/utils/media/manga'

  defineOptions({ name: 'MangaDownloadAction' })

  const props = defineProps<{ id: number; title: string; chapters: MangaPageData['chapters'] }>()
  const FORMAT_OPTIONS = [
    { value: 'CBZ', label: 'CBZ' },
    { value: 'EPUB', label: 'EPUB' },
  ]
  const format = ref<DownloadFormat>('CBZ')
  const chapters = computed(() =>
    props.chapters
      .filter(chapter => chapter.readable)
      .toSorted((a, b) => a.sort_key - b.sort_key || a.id - b.id),
  )
  const options = computed(() =>
    chapters.value.map(chapter => ({ id: chapter.id, label: getMangaEpisodeLabel(chapter) })),
  )
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
  <DownloadDialog :flow="flow" :title="title" unit="话">
    <DownloadSelection
      v-model="flow.selected.value"
      :selection="selection"
      unit="话"
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
