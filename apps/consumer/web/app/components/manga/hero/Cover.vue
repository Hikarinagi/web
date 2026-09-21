<script setup lang="ts">
  import { Stack } from '@hina-ui/vue'
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
  <Stack gap="none" class="relative mx-auto w-48 shrink-0 sm:w-56">
    <HikariImage
      :src="cover"
      :alt="title"
      class="rounded-xl shadow-hikari-cover-sm ring-1 ring-black/5 dark:ring-white/10"
      :ratio="layout.ratio"
      image-class="object-cover"
      :processing="layout.processing"
      :preload="{ fetchPriority: 'high' }"
      preview
    >
      <template #empty><MangaCoverFallback :title="title" /></template>
      <template #error><MangaCoverFallback :title="title" /></template>
    </HikariImage>
  </Stack>
</template>
