<script setup lang="ts">
  import { Star } from '@lucide/vue'
  import type { MangaRateStats } from '~/features/manga/rate'

  defineOptions({ name: 'MangaRatesStats' })
  const props = defineProps<{ stats: MangaRateStats }>()

  const filledStars = computed(() => Math.round(props.stats.average ?? 0))
</script>

<template>
  <section
    class="flex flex-col gap-5.5 rounded-2xl border border-surface-200 bg-surface-0 p-6 dark:border-surface-800 dark:bg-surface-900"
  >
    <h2 class="text-[22px] font-bold text-surface-900 dark:text-surface-0">大家说说</h2>

    <div class="flex flex-col gap-8 lg:flex-row lg:items-start">
      <div class="flex flex-col gap-2.5 lg:w-[220px] lg:shrink-0">
        <div class="flex items-baseline gap-1">
          <span class="text-[60px] leading-none font-semibold tabular-nums">
            {{ stats.average != null ? stats.average.toFixed(1) : '—' }}
          </span>
          <span class="text-base text-surface-500 dark:text-surface-400">/ 10</span>
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
        <p class="text-xs text-surface-600 dark:text-surface-400">
          {{ stats.rated_count }} 人评分 · {{ stats.content_count }} 人留了短评
        </p>
      </div>

      <MangaRatesStatsScores :distribution="stats.distribution" />
      <MangaRatesStatsProgress :counts="stats.status_counts" :played="stats.played_count" />
    </div>
  </section>
</template>
