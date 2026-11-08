<script setup lang="ts">
  import { LIGHT_NOVEL_STATUS_LABEL } from '~/features/light-novel/rate'
  import type {
    LightNovelRate,
    LightNovelRateKeyword,
    LightNovelRateStats,
  } from '~/features/light-novel/rate'
  import { useLightNovelRate } from '~/features/light-novel/useLightNovelRate'

  defineOptions({ name: 'LightNovelRatesStats' })
  const props = defineProps<{
    stats: LightNovelRateStats
    keywords: LightNovelRateKeyword[]
    lightNovelId: number
    workTitle: string
    myRate: LightNovelRate | null
  }>()

  const rateCtl = useLightNovelRate(props.lightNovelId, props.myRate)
  const dialogOpen = ref(false)

  const statuses = computed(() =>
    [
      { key: 'completed', label: LIGHT_NOVEL_STATUS_LABEL.COMPLETED },
      { key: 'going', label: LIGHT_NOVEL_STATUS_LABEL.GOING },
      { key: 'on_hold', label: LIGHT_NOVEL_STATUS_LABEL.ON_HOLD },
      { key: 'dropped', label: LIGHT_NOVEL_STATUS_LABEL.DROPPED },
    ].map(row => ({ ...row, count: props.stats.status_counts[row.key as 'completed'] })),
  )

  const countLabel = computed(
    () => `${props.stats.rated_count} 条评分 · ${props.stats.content_count} 条短评`,
  )
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
      <LightNovelRateDialog
        v-model:visible="dialogOpen"
        :light-novel-id="lightNovelId"
        :rate="rateCtl.rate.value"
        :work-title="workTitle"
        :upsert="rateCtl.upsert"
        :remove="rateCtl.remove"
      />
    </template>
  </RateStatsPanel>
</template>
