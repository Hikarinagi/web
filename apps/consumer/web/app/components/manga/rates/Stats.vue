<script setup lang="ts">
  import { entryRating } from '~/features/entry/rating'
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
  const rating = computed(() => entryRating(props.stats, ['想看', '在看', '看过']))
</script>

<template>
  <RateStatsPanel :rating="rating">
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
