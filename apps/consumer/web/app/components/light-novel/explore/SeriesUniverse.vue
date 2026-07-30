<script setup lang="ts">
  import type { LightNovelsLandingData } from '~~/server/api/pages/light-novels.get'
  import { titleOf } from '~/features/light-novel/explore'

  defineOptions({ name: 'LightNovelExploreSeriesUniverse' })
  const props = defineProps<{
    spotlight: NonNullable<LightNovelsLandingData['series_spotlight']>
  }>()

  const cards = computed(() => [
    { item: props.spotlight.series, badge: '本传' },
    ...props.spotlight.relations.map(rel => ({
      item: rel.target_light_novel,
      badge: getNovelRelationLabel(rel.relation),
    })),
  ])
</script>

<template>
  <LightNovelExploreSection
    title="系列宇宙"
    :meta="`${titleOf(spotlight.series)} · 本传 / 续作 / 外传 / 联动`"
  >
    <LightNovelExploreRailViewport>
      <LightNovelExploreSeriesCard
        v-for="(card, index) in cards"
        :key="`${card.item.id}-${index}`"
        :item="card.item"
        :badge="card.badge"
        class="w-[140px]"
      />
    </LightNovelExploreRailViewport>
  </LightNovelExploreSection>
</template>
