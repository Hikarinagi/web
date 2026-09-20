<script setup lang="ts">
  import type { LightNovelsLandingData } from '~~/server/api/pages/light-novels.get'

  defineOptions({ name: 'LightNovelExploreBunkoPicks' })
  defineProps<{ picks: LightNovelsLandingData['bunko_picks'] }>()
</script>

<template>
  <LightNovelExploreSection v-if="picks.length" title="文库精选" gap="loose">
    <div v-for="pick in picks" :key="pick.bunko.id" class="flex flex-col gap-3">
      <div class="flex items-center justify-between">
        <div class="flex items-baseline gap-2">
          <h3 class="text-base font-semibold text-surface-900 dark:text-surface-100">
            {{ pick.bunko.name }}
          </h3>
          <span class="text-xs text-surface-400">{{ pick.bunko.count }} 部</span>
        </div>
        <ViewAllLink :to="`/light-novels/bunko/${pick.bunko.id}`">查看全部</ViewAllLink>
      </div>
      <LightNovelExploreRailViewport>
        <LightNovelExploreSeriesCard
          v-for="row in pick.works.items"
          :key="row.light_novel.id"
          :item="row.light_novel"
          class="w-[136px]"
        />
      </LightNovelExploreRailViewport>
    </div>
  </LightNovelExploreSection>
</template>
