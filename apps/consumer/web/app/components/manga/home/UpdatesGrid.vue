<script setup lang="ts">
  import type { MangaHomePageData } from '~~/server/api/pages/mangas.get'

  defineOptions({ name: 'MangaHomeUpdatesGrid' })
  defineProps<{
    title?: string
    meta?: string
    to?: string
    items: MangaHomePageData['updates']['items'][number][]
  }>()
</script>

<template>
  <MangaHomeSection v-if="items.length && title" :title="title" :meta="meta" :to="to">
    <div class="grid grid-cols-3 gap-x-4 gap-y-6 sm:grid-cols-4 lg:grid-cols-6">
      <MangaHomeCard v-for="item in items" :key="item.id" :item="item" />
    </div>
  </MangaHomeSection>
  <div
    v-else-if="items.length"
    class="grid grid-cols-3 gap-x-4 gap-y-6 sm:grid-cols-4 lg:grid-cols-6"
  >
    <MangaHomeCard v-for="item in items" :key="item.id" :item="item" />
  </div>
</template>
