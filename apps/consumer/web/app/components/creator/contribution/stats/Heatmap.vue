<script setup lang="ts">
  import { CalendarRange } from '@lucide/vue'
  import type { BackendContributionStats } from '~/features/creator/contribution'
  import {
    HEATMAP_DIMENSIONS as D,
    HEATMAP_LEVEL_CLASSES as LEVELS,
    HEATMAP_WEEK_LABELS as WEEK_LABELS,
    heatmapTooltip,
    useContributionHeatmap,
  } from '~/features/creator/composables/useContributionHeatmap'

  const props = defineProps<{ stats: BackendContributionStats }>()
  const { grid, monthHeaders } = useContributionHeatmap(() => props.stats)
</script>

<template>
  <CardPanel
    title="贡献日历"
    :description="`过去 1 年共 ${stats.range.count} 次贡献`"
    :icon="CalendarRange"
  >
    <div class="flex flex-col gap-3 select-none" :style="{ maxWidth: `${D.width}px` }">
      <div class="overflow-x-auto">
        <div
          class="relative"
          :style="{ width: `${D.width}px`, height: `${D.height}px` }"
          role="img"
          aria-label="贡献日历"
        >
          <span
            v-for="header in monthHeaders"
            :key="`m-${header.col}`"
            class="absolute text-[10px] leading-none text-muted-color"
            :style="{
              left: `${D.weekLabelW + header.col * D.step}px`,
              top: '0px',
            }"
          >
            {{ header.label }}
          </span>
          <template v-for="(label, row) in WEEK_LABELS" :key="`w-${row}`">
            <span
              v-if="label"
              class="absolute text-[10px] leading-none text-muted-color"
              :style="{
                left: '0px',
                top: `${D.monthLabelH + row * D.step + (D.cell - 10) / 2}px`,
              }"
            >
              {{ label }}
            </span>
          </template>
          <template v-for="(col, c) in grid" :key="`c-${c}`">
            <div
              v-for="(cell, r) in col.cells"
              v-show="!cell.future"
              :key="`${c}-${r}`"
              v-tooltip.top="heatmapTooltip(cell)"
              class="absolute rounded-[2px]"
              :class="LEVELS[cell.level]"
              :style="{
                left: `${D.weekLabelW + c * D.step}px`,
                top: `${D.monthLabelH + r * D.step}px`,
                width: `${D.cell}px`,
                height: `${D.cell}px`,
              }"
            />
          </template>
        </div>
      </div>

      <div class="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 text-xs">
        <div class="flex items-center gap-1.5 text-muted-color">
          <span>少</span>
          <span
            v-for="(palette, level) in LEVELS"
            :key="level"
            class="size-2.5 rounded-[2px]"
            :class="palette"
          />
          <span>多</span>
        </div>
        <div class="text-muted-color">
          已合并
          <strong class="text-color">{{ stats.totals.merged }}</strong>
          <span class="mx-2 text-surface-300 dark:text-surface-700">·</span>
          待审
          <strong class="text-color">{{ stats.totals.pending }}</strong>
          <span class="mx-2 text-surface-300 dark:text-surface-700">·</span>
          已关闭
          <strong class="text-color">{{ stats.totals.closed }}</strong>
        </div>
      </div>
    </div>
  </CardPanel>
</template>
