<script setup lang="ts">
  defineOptions({ name: 'MangaRatesStatsScores' })
  const props = defineProps<{ distribution: { score: number; count: number }[] }>()

  const bars = computed(() => {
    const map = new Map(props.distribution.map(d => [d.score, d.count]))
    const max = Math.max(1, ...props.distribution.map(d => d.count))
    return Array.from({ length: 10 }, (_, i) => {
      const score = i + 1
      const count = map.get(score) ?? 0
      const px = count === 0 ? 4 : Math.max(8, Math.round((count / max) * 90))
      return { score, count, px, isMax: count > 0 && count === max }
    })
  })
</script>

<template>
  <div class="flex min-w-0 flex-1 flex-col gap-3">
    <span class="text-xs font-medium text-surface-600 dark:text-surface-400">分数分布</span>
    <div class="flex items-end gap-1.5">
      <div
        v-for="bar in bars"
        :key="bar.score"
        class="flex min-w-0 flex-1 flex-col items-center gap-1"
      >
        <div class="relative h-[90px] w-7">
          <div
            class="absolute bottom-0 left-0 flex w-full justify-center rounded"
            :class="
              bar.count === 0
                ? 'bg-surface-200 dark:bg-surface-700'
                : bar.isMax
                  ? 'bg-hikari-primary-500'
                  : 'border-[1.5px] border-hikari-primary-500 bg-hikari-primary-50 dark:bg-hikari-primary-950'
            "
            :style="{ height: `${bar.px}px` }"
          >
            <span v-if="bar.isMax" class="pt-0.5 text-[11px] font-semibold text-white">
              {{ bar.count }}
            </span>
          </div>
          <span
            v-if="bar.count > 0 && !bar.isMax"
            class="absolute left-0 w-full text-center text-[11px] font-semibold text-hikari-primary-700 dark:text-hikari-primary-300"
            :style="{ bottom: `${bar.px + 4}px` }"
          >
            {{ bar.count }}
          </span>
        </div>
        <span
          class="text-[11px] tabular-nums"
          :class="
            bar.count > 0
              ? 'font-semibold text-surface-700 dark:text-surface-200'
              : 'text-surface-400 dark:text-surface-500'
          "
        >
          {{ bar.score }}
        </span>
      </div>
    </div>
  </div>
</template>
