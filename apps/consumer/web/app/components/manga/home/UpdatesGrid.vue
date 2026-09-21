<script setup lang="ts">
  import { Grid } from '@hina-ui/vue'
  import type { MangaHomePageData } from '~~/server/api/pages/mangas.get'

  defineOptions({ name: 'MangaHomeUpdatesGrid' })
  defineProps<{
    title?: string
    meta?: string
    to?: string
    items: MangaHomePageData['updates']['items'][number][]
  }>()

  const GRID_CLASS = 'gap-x-4 gap-y-6 sm:grid-cols-4 lg:grid-cols-6'
</script>

<template>
  <MangaHomeSection v-if="items.length && title" :title="title" :meta="meta" :to="to">
    <Grid :cols="3" :class="GRID_CLASS">
      <MangaHomeCard v-for="item in items" :key="item.id" :item="item" />
    </Grid>
  </MangaHomeSection>
  <Grid v-else-if="items.length" :cols="3" :class="GRID_CLASS">
    <MangaHomeCard v-for="item in items" :key="item.id" :item="item" />
  </Grid>
</template>
