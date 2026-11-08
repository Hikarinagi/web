<script setup lang="ts">
  import { Panel } from '@hina-ui/vue'
  import { LibraryBig } from '@lucide/vue'
  import { mangaChapterLabel } from '@hikarinagi/shared'
  import type { MangaVolumePageData } from '~~/server/api/pages/manga-volumes/[id].get'
  import { useContents } from '~/features/manga/composables/useContents'
  import { chaptersInVolume } from '~/features/manga/volumes'

  defineOptions({ name: 'MangaVolumeChapters' })

  const props = defineProps<{
    volume: MangaVolumePageData['volume']
    volumes: MangaVolumePageData['volumes']
    chapters: MangaVolumePageData['chapters']
    progress: MangaVolumePageData['progress']
  }>()

  const scoped = computed(() =>
    chaptersInVolume(props.chapters, props.volume, props.volumes).filter(item => item.readable),
  )
  const contents = useContents(() => ({
    mangaId: props.volume.series_id,
    chapters: scoped.value,
    progress: props.progress,
  }))
  const { units, readIds, currentId, currentPage, signedIn, unit, range } = contents
  const description = computed(() => {
    const first = scoped.value[0]
    const last = scoped.value.at(-1)
    if (!first || !last) return undefined
    if (first.id === last.id) return mangaChapterLabel(first)
    return `${mangaChapterLabel(first)} ～ ${mangaChapterLabel(last)}`
  })
</script>

<template>
  <Panel v-if="scoped.length" title="本卷收录" :count="scoped.length" :description="description">
    <template #icon><LibraryBig /></template>
    <MangaContentsBrowser
      v-model:unit="unit"
      v-model:range="range"
      :units="units"
      :current-id="currentId"
      :current-page="currentPage"
      :read-ids="readIds"
      :signed-in="signedIn"
      @select="contents.open"
    />
  </Panel>
</template>
