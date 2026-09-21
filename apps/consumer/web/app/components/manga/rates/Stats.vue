<script setup lang="ts">
  import type { MangaRate, MangaRateStats } from '~/features/manga/rate'
  import { useMangaRate } from '~/features/manga/useMangaRate'

  defineOptions({ name: 'MangaRatesStats' })
  const props = defineProps<{
    stats: MangaRateStats
    mangaId: number
    workTitle: string
    myRate: MangaRate | null
  }>()

  const rateCtl = useMangaRate(props.mangaId, props.myRate)
  const dialogOpen = ref(false)

  const statuses = computed(() =>
    [
      { key: 'completed', label: '看过' },
      { key: 'going', label: '在看' },
      { key: 'on_hold', label: '搁置' },
      { key: 'dropped', label: '弃坑' },
    ].map(row => ({ ...row, count: props.stats.status_counts[row.key as 'completed'] })),
  )

  const countLabel = computed(() => `${props.stats.rated_count} 人评分`)
</script>

<template>
  <RateStatsPanel
    title="安利墙"
    :average="stats.average"
    :rated-count="stats.rated_count"
    :count-label="countLabel"
    :distribution="stats.distribution"
    :statuses="statuses"
  >
    <template #action>
      <RateStatsMyRateButton :score="rateCtl.score.value" @click="dialogOpen = true" />
      <MangaRateDialog
        v-model:visible="dialogOpen"
        :rate="rateCtl.rate.value"
        :work-title="workTitle"
        :upsert="rateCtl.upsert"
        :remove="rateCtl.remove"
      />
    </template>
  </RateStatsPanel>
</template>
