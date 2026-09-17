<script setup lang="ts">
  import { Rating } from '@hina-ui/vue'
  import type { MangaPageData } from '~~/server/api/pages/mangas/[id].get'

  defineOptions({ name: 'MangaRatesSummary' })
  const props = defineProps<{
    stats: MangaPageData['rate_stats']
    topRates: MangaPageData['top_rates']
    mangaId: number
  }>()

  const meta = computed(() => {
    const avg = props.stats.average
    const read = `${props.stats.played_count} 人看过`
    return avg == null ? read : `${read} · 平均 ${avg.toFixed(1)} / 10`
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
          {{ stats.rated_count }} 条评分 · {{ stats.status_counts.completed }} 人看完
        </p>
      </div>

      <MangaRatesTopReviews
        :rates="topRates.items"
        :total="stats.content_count"
        :manga-id="mangaId"
      />
    </div>
  </WorkSection>
</template>
