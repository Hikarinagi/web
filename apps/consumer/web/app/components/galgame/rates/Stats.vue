<script setup lang="ts">
  import type { GalgameRate, GalgameRateKeyword, GalgameRateStats } from '~/features/galgame/rate'
  import { useGalgameRate } from '~/features/galgame/useGalgameRate'

  defineOptions({ name: 'GalgameRatesStats' })
  const props = defineProps<{
    stats: GalgameRateStats
    keywords: GalgameRateKeyword[]
    galgameId: number
    workTitle: string
    myRate: GalgameRate | null
  }>()

  const rateCtl = useGalgameRate(props.galgameId, props.myRate)
  const dialogOpen = ref(false)

  const statuses = computed(() =>
    [
      { key: 'completed', label: '通关' },
      { key: 'going', label: '在玩' },
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
    :keywords="keywords"
  >
    <template #action>
      <RateStatsMyRateButton :score="rateCtl.score.value" @click="dialogOpen = true" />
      <GalgameRateDialog
        v-model:visible="dialogOpen"
        :galgame-id="galgameId"
        :rate="rateCtl.rate.value"
        :work-title="workTitle"
        :upsert="rateCtl.upsert"
        :remove="rateCtl.remove"
      />
    </template>
  </RateStatsPanel>
</template>
