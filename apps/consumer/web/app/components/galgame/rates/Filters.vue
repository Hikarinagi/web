<script setup lang="ts">
  import { ArrowUpDown } from '@lucide/vue'
  import {
    GALGAME_STATUS_LABEL,
    GALGAME_STATUS_ORDER,
    type GalgameRateStatus,
  } from '~/features/galgame/rate'

  defineOptions({ name: 'GalgameRatesFilters' })
  const sort = defineModel<'new' | 'hot'>('sort', { required: true })
  const status = defineModel<GalgameRateStatus | null>('status', { required: true })
  const score = defineModel<number | null>('score', { required: true })
  const spoiler = defineModel<'only' | 'hide' | null>('spoiler', { required: true })
  const hasDimensions = defineModel<boolean>('hasDimensions', { required: true })
  defineProps<{ total: number }>()

  const SORT_OPTIONS = [
    { label: '推荐', value: 'hot' as const },
    { label: '最新', value: 'new' as const },
  ]
  const STATUS_OPTIONS = [
    { label: '全部', value: null },
    ...GALGAME_STATUS_ORDER.map(s => ({ label: GALGAME_STATUS_LABEL[s], value: s })),
  ]
  const SCORE_OPTIONS = [
    { label: '全部', value: null },
    ...Array.from({ length: 10 }, (_, i) => ({ label: `${10 - i} 分`, value: 10 - i })),
  ]
  const SPOILER_OPTIONS = [
    { label: '全部', value: null },
    { label: '只看含剧透', value: 'only' as const },
    { label: '隐藏剧透', value: 'hide' as const },
  ]
  const DIMS_OPTIONS = [
    { label: '全部', value: false },
    { label: '仅填了多维', value: true },
  ]
</script>

<template>
  <div class="flex flex-wrap items-center gap-3">
    <GalgameRatesFilterSelect
      v-model="sort"
      :options="SORT_OPTIONS"
      placeholder="推荐"
      :icon="ArrowUpDown"
    />
    <div class="h-5 w-px bg-surface-200 dark:bg-surface-700" />
    <GalgameRatesFilterSelect v-model="status" :options="STATUS_OPTIONS" placeholder="全部状态" />
    <GalgameRatesFilterSelect v-model="score" :options="SCORE_OPTIONS" placeholder="全部评分" />
    <GalgameRatesFilterSelect v-model="spoiler" :options="SPOILER_OPTIONS" placeholder="含剧透" />
    <GalgameRatesFilterSelect
      v-model="hasDimensions"
      :options="DIMS_OPTIONS"
      placeholder="填了多维"
    />
    <span class="flex-1" />
    <span class="text-xs text-surface-400 dark:text-surface-500">共 {{ total }} 条</span>
  </div>
</template>
