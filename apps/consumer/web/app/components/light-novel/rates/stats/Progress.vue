<script setup lang="ts">
  import { CircleCheck, CircleX, PauseCircle, Play } from '@lucide/vue'
  import type { Component } from 'vue'
  import { LIGHT_NOVEL_STATUS_LABEL } from '~/features/light-novel/rate'
  import type { LightNovelRateStats } from '~/features/light-novel/rate'

  defineOptions({ name: 'LightNovelRatesStatsProgress' })
  const props = defineProps<{ counts: LightNovelRateStats['status_counts']; played: number }>()

  const ROWS: {
    key: 'completed' | 'going' | 'on_hold' | 'dropped'
    label: string
    icon: Component
    primary?: boolean
  }[] = [
    {
      key: 'completed',
      label: LIGHT_NOVEL_STATUS_LABEL.COMPLETED,
      icon: CircleCheck,
      primary: true,
    },
    { key: 'going', label: LIGHT_NOVEL_STATUS_LABEL.GOING, icon: Play },
    { key: 'on_hold', label: LIGHT_NOVEL_STATUS_LABEL.ON_HOLD, icon: PauseCircle },
    { key: 'dropped', label: LIGHT_NOVEL_STATUS_LABEL.DROPPED, icon: CircleX },
  ]

  const rows = computed(() =>
    ROWS.filter(r => props.counts[r.key] > 0).map(r => ({
      ...r,
      count: props.counts[r.key],
      pct: props.played > 0 ? Math.round((props.counts[r.key] / props.played) * 100) : 0,
    })),
  )
</script>

<template>
  <div class="flex w-full flex-col gap-3.5 lg:w-[280px] lg:shrink-0">
    <span class="text-xs font-medium text-surface-600 dark:text-surface-400">进度</span>

    <div v-for="row in rows" :key="row.key" class="flex flex-col gap-1.5">
      <div class="flex items-center gap-2">
        <component
          :is="row.icon"
          class="size-3.5"
          :class="row.primary ? 'text-hikari-primary-600' : 'text-surface-500'"
        />
        <span
          class="text-[13px] font-medium"
          :class="
            row.primary
              ? 'text-hikari-primary-700 dark:text-hikari-primary-300'
              : 'text-surface-700 dark:text-surface-200'
          "
        >
          {{ row.label }}
        </span>
        <span class="flex-1" />
        <span class="text-xs font-semibold text-surface-600 tabular-nums dark:text-surface-400">
          {{ row.count }}/{{ played }} · {{ row.pct }}%
        </span>
      </div>
      <div class="h-2 w-full overflow-hidden rounded bg-surface-100 dark:bg-surface-800">
        <div
          class="h-full rounded"
          :class="row.primary ? 'bg-hikari-primary-500' : 'bg-surface-400 dark:bg-surface-500'"
          :style="{ width: `${row.pct}%` }"
        />
      </div>
    </div>
  </div>
</template>
