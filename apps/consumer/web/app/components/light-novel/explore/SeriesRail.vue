<script setup lang="ts">
  import type { SeriesCardItem } from '~/features/light-novel/explore'

  defineOptions({ name: 'LightNovelExploreSeriesRail' })
  defineProps<{
    title: string
    meta?: string
    to?: string
    items: SeriesCardItem[]
    cardClass?: string
  }>()
</script>

<template>
  <LightNovelExploreSection v-if="items.length" :title="title" :meta="meta" :to="to">
    <LightNovelExploreRailViewport>
      <LightNovelExploreSeriesCard
        v-for="item in items"
        :key="item.id"
        :item="item"
        :class="cardClass ?? 'w-[150px]'"
      />
    </LightNovelExploreRailViewport>
  </LightNovelExploreSection>
</template>
