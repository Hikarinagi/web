<script setup lang="ts">
  import type { RateTopReviewItem } from '~/components/rate/TopReviews.vue'
  import type { GalgameRate } from '~/features/galgame/rate'
  import { useGalgameRate } from '~/features/galgame/useGalgameRate'
  import type { GalgamePageData } from '~~/server/api/pages/galgames/[id].get'

  defineOptions({ name: 'GalgameRatesSummary' })
  const props = defineProps<{
    stats: GalgamePageData['rate_stats']
    topRates: GalgamePageData['top_rates']
    galgame: GalgamePageData['galgame']
    myRate: GalgameRate | null
  }>()

  const galgameId = computed(() => props.galgame.id)
  const workTitle = computed(
    () => props.galgame.trans_title || props.galgame.origin_title || `Galgame #${props.galgame.id}`,
  )
  const rateCtl = useGalgameRate(props.galgame.id, props.myRate)
  const dialogOpen = ref(false)

  const meta = computed(() => {
    const avg = props.stats.average
    const played = `${props.stats.played_count} 人玩过`
    return avg == null ? played : `${played} · 平均 ${avg.toFixed(1)} / 10`
  })

  const statLine = computed(
    () => `${props.stats.rated_count} 条评分 · ${props.stats.status_counts.completed} 人通关`,
  )

  const reviews = computed<RateTopReviewItem[]>(() =>
    props.topRates.items
      .filter(r => r.rate != null && r.rate_content.trim())
      .slice(0, 6)
      .map(r => ({
        key: String(r.id),
        rater: r.rater,
        rate: r.rate,
        content: r.rate_content,
        isSpoiler: r.is_spoiler,
      })),
  )
</script>

<template>
  <RateSummary
    :meta="meta"
    :empty="stats.rated_count === 0"
    :average="stats.average"
    :stat-line="statLine"
    :reviews="reviews"
    :total="stats.content_count"
    :to="`/galgames/${galgameId}/rates`"
  >
    <template #action>
      <Button login-required size="sm" variant="soft" @click="dialogOpen = true">
        我来写第一条！
      </Button>
      <GalgameRateDialog
        v-model:visible="dialogOpen"
        :galgame-id="galgameId"
        :rate="rateCtl.rate.value"
        :work-title="workTitle"
        :upsert="rateCtl.upsert"
        :remove="rateCtl.remove"
      />
    </template>
  </RateSummary>
</template>
