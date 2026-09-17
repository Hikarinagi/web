<script setup lang="ts">
  import { Rating } from '@hina-ui/vue'
  import type { GalgamePageData } from '~~/server/api/pages/galgames/[id].get'

  defineOptions({ name: 'GalgameRatesSummary' })
  const props = defineProps<{
    stats: GalgamePageData['rate_stats']
    topRates: GalgamePageData['top_rates']
    galgameId: number
  }>()

  const meta = computed(() => {
    const avg = props.stats.average
    const played = `${props.stats.played_count} 人玩过`
    return avg == null ? played : `${played} · 平均 ${avg.toFixed(1)} / 10`
  })
</script>

<template>
  <WorkSection
    title="安利墙"
    :meta="meta"
    :empty="stats.rated_count === 0"
    empty-text="还没有人评分"
  >
    <div class="flex flex-col gap-6 lg:flex-row lg:items-start">
      <div
        class="flex flex-col gap-3 rounded-xl border border-surface-200 bg-surface-0 p-5 lg:sticky lg:top-[calc(var(--app-header-height)+1.5rem)] lg:w-[220px] lg:shrink-0 dark:border-surface-800 dark:bg-surface-900"
      >
        <div class="flex items-baseline gap-1">
          <span
            class="text-5xl leading-none font-bold text-surface-900 tabular-nums dark:text-surface-0"
          >
            {{ stats.average != null ? stats.average.toFixed(1) : '—' }}
          </span>
          <span class="text-sm text-surface-500 dark:text-surface-400">/ 10</span>
        </div>
        <Rating :model-value="stats.average ?? 0" :max="10" readonly size="sm" />
        <p class="text-xs text-surface-500 dark:text-surface-400">
          {{ stats.rated_count }} 人评分 · {{ stats.status_counts.completed }} 人通关
        </p>
      </div>

      <GalgameRatesTopReviews
        :rates="topRates.items"
        :total="stats.content_count"
        :galgame-id="galgameId"
      />
    </div>
  </WorkSection>
</template>
