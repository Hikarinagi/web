<script setup lang="ts">
  import type { MangaVolumePageData } from '~~/server/api/pages/manga-volumes/[id].get'
  import { getCoverMediaLayout } from '~/utils/media/layout'

  defineOptions({ name: 'MangaVolumeHeroCover' })
  const props = defineProps<{
    cover:
      | MangaVolumePageData['volume']['cover']
      | MangaVolumePageData['volume']['manga']['covers'][number]['media']
      | null
    title: string
  }>()

  const layout = computed(() => getCoverMediaLayout(props.cover))
</script>

<template>
  <div class="relative mx-auto w-44 shrink-0 sm:w-52">
    <HikariImage
      :src="cover"
      :alt="title"
      class="rounded-xl shadow-xl ring-1 ring-black/5 dark:ring-white/10"
      :style="{ aspectRatio: layout.aspectRatio }"
      image-class="object-cover"
      :processing="layout.processing"
      :preload="{ fetchPriority: 'high' }"
      preview
    >
      <template #empty><MangaCoverFallback :title="title" /></template>
      <template #error><MangaCoverFallback :title="title" /></template>
    </HikariImage>
  </div>
</template>
