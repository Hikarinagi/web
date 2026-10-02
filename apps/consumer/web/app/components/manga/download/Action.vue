<script setup lang="ts">
  import { Inline, SegmentedControl, Text } from '@hina-ui/vue'
  import type { MangaDownloadChapter } from '~/features/manga/download'
  import { useMangaDownload, type MangaPackageFormat } from '~/features/manga/useMangaDownload'
  import { useSelection } from '~/features/download/useSelection'
  import { getMangaEpisodeLabel } from '~/utils/media/manga'

  const props = defineProps<{ id: number; title: string; chapters: MangaDownloadChapter[] }>()
  const chapters = computed(() =>
    props.chapters
      .filter(chapter => chapter.readable)
      .toSorted((a, b) => a.sort_key - b.sort_key || a.id - b.id),
  )
  const FORMAT_OPTIONS = [
    { value: 'cbz', label: 'CBZ' },
    { value: 'epub', label: 'EPUB' },
  ]
  const format = ref<MangaPackageFormat>('cbz')
  const {
    open,
    loading,
    busy,
    selected,
    parts,
    completed,
    finished,
    status,
    quote,
    quoting,
    needsCard,
    prepare,
    refreshQuote,
    download,
    stop,
    reselect,
  } = useMangaDownload(
    () => props.id,
    () => format.value,
  )
  watch(format, () => {
    reselect()
    void refreshQuote()
  })
  const options = computed(() =>
    chapters.value.map(chapter => ({ id: chapter.id, label: getMangaEpisodeLabel(chapter) })),
  )
  watch(
    chapters,
    value => {
      selected.value = value.map(chapter => chapter.id)
    },
    { immediate: true },
  )
  const selection = useSelection(() => options.value, selected)
</script>

<template>
  <DownloadTrigger v-if="chapters.length" :loading="loading || busy" @click="prepare" />
  <DownloadDialog
    v-model:open="open"
    :title="title"
    :format="format === 'epub' ? 'EPUB' : 'CBZ'"
    :summary="`已选 ${selected.length} 章`"
    :status="status"
    :required="selected.length ? (quote?.required_cards ?? null) : 0"
    :quoting="quoting"
    :needs-card="needsCard"
    :busy="busy"
    :disabled="!selected.length || !quote || quoting"
    :resume="!!parts.length"
    :finished="finished"
    @download="download"
    @stop="stop"
    @reselect="reselect"
  >
    <DownloadQueue v-if="parts.length" :parts="parts" :completed="completed" :busy="busy" />
    <DownloadSelection
      v-else
      v-model="selected"
      :selection="selection"
      unit="章"
      :disabled="busy"
    />
    <Inline align="center" gap="sm">
      <Text size="sm" tone="muted">格式</Text>
      <SegmentedControl
        v-model="format"
        :options="FORMAT_OPTIONS"
        size="sm"
        :disabled="busy || parts.length > 0"
      />
    </Inline>
  </DownloadDialog>
</template>
