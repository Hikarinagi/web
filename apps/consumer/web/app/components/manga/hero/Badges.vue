<script setup lang="ts">
  import { Inline, Tag } from '@hina-ui/vue'
  import type { MangaPageData } from '~~/server/api/pages/mangas/[id].get'
  import { mangaSerialStatusLabel } from '~/features/manga/labels'

  defineOptions({ name: 'MangaHeroBadges' })

  defineProps<{
    manga: MangaPageData['manga']
    magazine: { id: number; name: string } | null
  }>()
</script>

<template>
  <Inline gap="sm" justify="center" wrap class="lg:justify-start">
    <Tag tone="accent" size="md">{{ mangaSerialStatusLabel(manga.serial_status) }}</Tag>
    <NuxtLink v-if="magazine" :to="`/mangas/magazine/${magazine.id}`">
      <Tag tone="neutral" size="md" class="hn-state-layer cursor-pointer">{{ magazine.name }}</Tag>
    </NuxtLink>
    <Tag v-if="manga.nsfw" tone="danger" size="md">NSFW</Tag>
  </Inline>
</template>
