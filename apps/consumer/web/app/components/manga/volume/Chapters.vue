<script setup lang="ts">
  import { Empty, Panel, Stack } from '@hina-ui/vue'
  import { LibraryBig } from '@lucide/vue'
  import type { MangaVolumePageData } from '~~/server/api/pages/manga-volumes/[id].get'
  import { chaptersInVolume, wholeVolumeOf } from '~/features/manga/volumes'
  import { getMangaEpisodeLabel } from '~/utils/media/manga'

  defineOptions({ name: 'MangaVolumeChapters' })

  const props = defineProps<{
    volume: MangaVolumePageData['volume']
    volumes: MangaVolumePageData['volumes']
    chapters: MangaVolumePageData['chapters']
    progress: MangaVolumePageData['progress']
  }>()

  const scoped = computed(() => chaptersInVolume(props.chapters, props.volume, props.volumes))
  const whole = computed(() => wholeVolumeOf(props.chapters, props.volume, props.volumes))
  const readIds = computed(() => new Set(props.progress?.read_chapter_ids ?? []))
  const description = computed(() => {
    const first = scoped.value[0]
    const last = scoped.value[scoped.value.length - 1]
    if (!first || !last) return undefined
    if (first.id === last.id) return getMangaEpisodeLabel(first)
    return `${getMangaEpisodeLabel(first)} ～ ${getMangaEpisodeLabel(last)}`
  })
</script>

<template>
  <Panel
    v-if="scoped.length || !whole"
    title="本卷收录"
    :count="scoped.length"
    :description="description"
  >
    <template #icon><LibraryBig /></template>
    <Stack v-if="scoped.length" gap="none">
      <MangaChaptersGrid
        :manga-id="volume.manga.id"
        :chapters="scoped"
        :new-chapter-id="null"
        :current-chapter-id="progress?.chapter.id ?? null"
        :read-ids="readIds"
      />
    </Stack>
    <Empty v-else title="没有内容">
      <template #icon><LibraryBig /></template>
      <MangaVolumeContribute :volume="volume" size="sm" variant="soft" />
    </Empty>
  </Panel>
</template>
