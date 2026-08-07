<script setup lang="ts">
  import { Star } from '@lucide/vue'
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
  const filledStars = computed(() => Math.round(props.stats.average ?? 0))
</script>

<template>
  <GalgameSection
    title="大家的评价"
    :meta="meta"
    :empty="stats.played_count === 0 && stats.rated_count === 0"
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
        <div class="flex gap-0.5">
          <Star
            v-for="i in 10"
            :key="i"
            class="size-3.5"
            :class="
              i <= filledStars
                ? 'fill-amber-400 text-amber-400'
                : 'fill-surface-200 text-surface-200 dark:fill-surface-700 dark:text-surface-700'
            "
          />
        </div>
        <p class="text-xs text-surface-500 dark:text-surface-400">
          {{ stats.rated_count }} 人评分 · {{ stats.status_counts.completed }} 人通关
        </p>
      </div>

      <GalgameRatesTopReviews
        :rates="topRates.items"
        :total="stats.rated_count"
        :galgame-id="galgameId"
      />
    </div>
  </GalgameSection>
</template>
