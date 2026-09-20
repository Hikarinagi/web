<script setup lang="ts">
  import { ArrowUpDown } from '@lucide/vue'
  import { MANGA_STATUS_LABEL, type MangaRateStatus } from '~/features/manga/rate'
  import { REVIEW_STATUS_ORDER } from '~/features/rate/status'

  defineOptions({ name: 'MangaRatesFilters' })
  const sort = defineModel<'new' | 'hot'>('sort', { required: true })
  const status = defineModel<MangaRateStatus | null>('status', { required: true })
  const score = defineModel<number | null>('score', { required: true })
  const spoiler = defineModel<'only' | 'hide' | null>('spoiler', { required: true })
  defineProps<{ total: number }>()

  const SORT_OPTIONS = [
    { label: '推荐', value: 'hot' as const },
    { label: '最新', value: 'new' as const },
  ]
  const STATUS_OPTIONS = [
    { label: '全部', value: null },
    ...REVIEW_STATUS_ORDER.map(s => ({ label: MANGA_STATUS_LABEL[s], value: s })),
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
</script>

<template>
  <div class="flex flex-wrap items-center gap-3">
    <MangaRatesFilterSelect
      v-model="sort"
      :options="SORT_OPTIONS"
      placeholder="推荐"
      :icon="ArrowUpDown"
    />
    <div class="h-5 w-px bg-surface-200 dark:bg-surface-700" />
    <MangaRatesFilterSelect v-model="status" :options="STATUS_OPTIONS" placeholder="全部状态" />
    <MangaRatesFilterSelect v-model="score" :options="SCORE_OPTIONS" placeholder="全部评分" />
    <MangaRatesFilterSelect v-model="spoiler" :options="SPOILER_OPTIONS" placeholder="含剧透" />
    <span class="flex-1" />
    <span class="text-xs text-surface-400 dark:text-surface-500">共 {{ total }} 条短评</span>
  </div>
</template>
