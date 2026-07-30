<script setup lang="ts">
  import type { MangaPageData } from '~~/server/api/pages/mangas/[id].get'
  import { mangaSerialStatusLabel } from '~/features/manga/labels'

  defineOptions({ name: 'MangaHeroBadges' })

  defineProps<{
    manga: MangaPageData['manga']
    magazine: { id: number; name: string } | null
  }>()
</script>

<template>
  <div class="flex flex-wrap justify-center gap-2 lg:justify-start">
    <Tag
      :value="mangaSerialStatusLabel(manga.serial_status)"
      class="border-0! bg-primary/10! px-2.5! py-1! text-sm! font-medium! text-primary!"
    />
    <NuxtLink v-if="magazine" :to="`/mangas/magazine/${magazine.id}`">
      <Tag
        :value="magazine.name"
        severity="secondary"
        class="cursor-pointer px-2.5! py-1! text-sm! font-medium! transition-colors hover:bg-surface-200! dark:hover:bg-surface-700!"
      />
    </NuxtLink>
    <Tag
      v-if="manga.nsfw"
      value="NSFW"
      severity="danger"
      class="px-2.5! py-1! text-sm! font-medium!"
    />
  </div>
</template>
