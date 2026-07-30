<script setup lang="ts">
  import type { MangaVolumePageData } from '~~/server/api/pages/manga-volumes/[id].get'

  defineOptions({ name: 'MangaVolumeHeroCta' })
  defineProps<{ volume: MangaVolumePageData['volume'] }>()
</script>

<template>
  <div class="items-stretch justify-center gap-2.5 lg:justify-start">
    <ShareButton :to="`/manga-volumes/${volume.id}`" tooltip="分享" severity="secondary" outlined />
  </div>
</template>
