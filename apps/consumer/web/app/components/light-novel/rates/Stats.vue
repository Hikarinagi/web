<script setup lang="ts">
  import { entryRating } from '~/features/entry/rating'
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
  const rating = computed(() => entryRating(props.stats, ['想读', '在读', '读过']))
</script>

<template>
  <RateStatsPanel :rating="rating" :keywords="keywords">
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
