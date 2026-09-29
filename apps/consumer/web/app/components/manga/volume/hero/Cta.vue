<script setup lang="ts">
  import { Inline } from '@hina-ui/vue'
  import type { MangaVolumePageData } from '~~/server/api/pages/manga-volumes/[id].get'

  defineOptions({ name: 'MangaVolumeHeroCta' })
  const props = defineProps<{
    volume: MangaVolumePageData['volume']
    chapters: MangaVolumePageData['chapters']
  }>()
  const scoped = computed(() =>
    props.volume.volume_number == null
      ? []
      : props.chapters.filter(chapter => chapter.volume_number === props.volume.volume_number),
  )
</script>

<template>
  <Inline gap="sm" justify="center" class="lg:justify-start">
    <ShareButton :to="`/manga-volumes/${volume.id}`" tooltip="分享" size="lg" />
    <MangaDownloadAction
      :id="volume.series_id"
      :title="volume.manga.name_cn || volume.manga.name"
      :chapters="scoped"
    />
    <WorkEditButton resource-type="manga-volume" :resource-id="volume.id" size="lg" />
  </Inline>
</template>
