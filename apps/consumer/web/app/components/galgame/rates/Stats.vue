<script setup lang="ts">
  import { gameRating } from '~/features/entry/rating'
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
  const rating = computed(() => gameRating(props.stats))
</script>

<template>
  <RateStatsPanel :rating="rating" :keywords="keywords">
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
