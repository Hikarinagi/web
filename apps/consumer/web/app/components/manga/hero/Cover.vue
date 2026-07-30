<script setup lang="ts">
  import type { MangaPageData } from '~~/server/api/pages/mangas/[id].get'
  import { getCoverMediaLayout } from '~/utils/media/layout'

  defineOptions({ name: 'MangaHeroCover' })

  const props = defineProps<{
    cover: MangaPageData['manga']['covers'][number]['media'] | null
    title: string
  }>()

  const layout = computed(() => getCoverMediaLayout(props.cover))
</script>

<template>
  <div class="relative mx-auto w-48 shrink-0 sm:w-56">
    <HikariImage
      :src="cover"
      :alt="title"
      class="rounded-xl shadow-[0_14px_44px_rgba(15,23,42,0.22)] ring-1 ring-black/5 dark:ring-white/10"
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
