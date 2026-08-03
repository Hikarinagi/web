<script setup lang="ts">
  import type { GalgameStreamData } from '~~/server/api/pages/galgames/stream.get'

  defineOptions({ name: 'GalgameExploreRecommendGrid' })
  defineProps<{
    items: Extract<GalgameStreamData['modules'][number], { kind: 'grid' }>['items']
  }>()
</script>

<template>
  <div v-if="items.length" class="grid grid-cols-3 gap-x-4 gap-y-7 sm:grid-cols-4 lg:grid-cols-6">
    <GalgameBrowseCard v-for="item in items" :key="item.id" :item="item" />
  </div>
</template>
