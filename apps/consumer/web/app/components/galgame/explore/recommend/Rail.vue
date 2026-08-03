<script setup lang="ts">
  import type { GalgameStreamData } from '~~/server/api/pages/galgames/stream.get'

  defineOptions({ name: 'GalgameExploreRecommendRail' })
  defineProps<{
    title: string
    to?: string
    items: Extract<GalgameStreamData['modules'][number], { kind: 'rail' }>['items']
  }>()
</script>

<template>
  <GalgameExploreSection v-if="items.length" :title="title" :to="to">
    <GalgameExploreRailViewport>
      <GalgameExploreReleaseCard
        v-for="item in items"
        :key="item.id"
        :item="item"
        :show-release="false"
      />
    </GalgameExploreRailViewport>
  </GalgameExploreSection>
</template>
