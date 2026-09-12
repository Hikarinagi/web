<script setup lang="ts">
  import { Inline } from '@hina-ui/vue'
  import type { MangaVolumePageData } from '~~/server/api/pages/manga-volumes/[id].get'

  defineOptions({ name: 'MangaVolumeHeroCta' })
  defineProps<{ volume: MangaVolumePageData['volume'] }>()
</script>

<template>
  <Inline gap="sm" justify="center" class="lg:justify-start">
    <ShareButton :to="`/manga-volumes/${volume.id}`" tooltip="分享" variant="outline" />
    <WorkEditButton resource-type="manga-volume" :resource-id="volume.id" />
  </Inline>
</template>
