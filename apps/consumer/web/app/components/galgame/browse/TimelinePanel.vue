<script setup lang="ts">
  import type { GalgameHistogram } from '~/features/galgame/explore'
  import {
    useReleaseTimeline,
    type TimelineRangeUpdate,
  } from '~/features/galgame/useReleaseTimeline'

  defineOptions({ name: 'GalgameBrowseTimelinePanel' })
  const props = defineProps<{
    title: string
    histogram: GalgameHistogram
    from?: string
    periods: string[]
    to?: string
  }>()
  const emit = defineEmits<{ update: [value: TimelineRangeUpdate] }>()
  const {
    changeFromMonth,
    changeFromYear,
    changeMode,
    changePeriods,
    changeToMonth,
    changeToYear,
    changeYearRange,
    clear,
    hasSelection,
    maxYear,
    minYear,
    mode,
    modeOptions,
    monthOptions,
    periodOptions,
    rangeFromMonth,
    rangeFromYear,
    rangeToMonth,
    rangeToYear,
    rangeYears,
    releasePeriodLabel,
    selectedLabel,
    yearOptions,
  } = useReleaseTimeline(props, emit)
</script>

<template>
  <div
    class="flex flex-col gap-4 rounded-xl border border-surface-200 bg-surface-0 px-5 py-4 dark:border-surface-800 dark:bg-surface-900"
  >
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div class="flex items-center gap-2">
        <p class="text-sm font-medium text-surface-600 dark:text-surface-300">{{ title }}</p>
        <Tag severity="secondary" :value="selectedLabel" />
      </div>
      <div class="flex items-center gap-2">
        <Button
          v-if="hasSelection"
          label="清除"
          severity="secondary"
          text
          size="small"
          @click="clear"
        />
        <SelectButton
          :model-value="mode"
          :options="modeOptions"
          option-label="label"
          option-value="value"
          :allow-empty="false"
          size="small"
          @change="event => changeMode(event.value)"
        />
      </div>
    </div>

    <div v-if="mode === 'range'" class="flex flex-col gap-4">
      <div class="flex flex-col gap-2 px-1">
        <div
          class="flex items-center justify-between text-xs text-surface-500 dark:text-surface-400"
        >
          <span>年份跨度</span>
          <span>{{ rangeYears[0] }}年 – {{ rangeYears[1] }}年</span>
        </div>
        <Slider
          :model-value="rangeYears"
          range
          :min="minYear"
          :max="maxYear"
          @change="changeYearRange"
        />
        <div class="flex justify-between text-xs text-surface-400">
          <span>{{ minYear }}</span>
          <span>{{ maxYear }}</span>
        </div>
      </div>

      <div class="grid gap-3 lg:grid-cols-[1fr_auto_1fr] lg:items-center">
        <div class="flex min-w-0 flex-wrap items-center gap-2">
          <span class="w-10 text-xs font-medium text-surface-500 dark:text-surface-400">开始</span>
          <Select
            :model-value="rangeFromYear"
            :options="yearOptions"
            option-label="label"
            option-value="value"
            filter
            size="small"
            class="w-36"
            @update:model-value="changeFromYear"
          />
          <Select
            :model-value="rangeFromMonth"
            :options="monthOptions"
            option-label="label"
            option-value="value"
            placeholder="全年"
            show-clear
            size="small"
            class="w-24"
            @update:model-value="changeFromMonth"
          />
        </div>

        <span class="hidden text-xs text-surface-400 lg:block">至</span>

        <div class="flex min-w-0 flex-wrap items-center gap-2">
          <span class="w-10 text-xs font-medium text-surface-500 dark:text-surface-400">结束</span>
          <Select
            :model-value="rangeToYear"
            :options="yearOptions"
            option-label="label"
            option-value="value"
            filter
            size="small"
            class="w-36"
            @update:model-value="changeToYear"
          />
          <Select
            :model-value="rangeToMonth"
            :options="monthOptions"
            option-label="label"
            option-value="value"
            placeholder="全年"
            show-clear
            size="small"
            class="w-24"
            @update:model-value="changeToMonth"
          />
        </div>
      </div>
    </div>

    <div v-else class="flex flex-col gap-3">
      <MultiSelect
        :model-value="props.periods"
        :options="periodOptions"
        option-label="label"
        option-value="value"
        placeholder="选择年份或月份"
        filter
        size="small"
        :max-selected-labels="2"
        selected-items-label="已选 {0} 个"
        class="w-full md:w-lg"
        @update:model-value="changePeriods"
      />

      <div v-if="props.periods.length" class="flex flex-wrap gap-2">
        <Chip v-for="period in props.periods" :key="period" :label="releasePeriodLabel(period)" />
      </div>
    </div>
  </div>
</template>
