<script setup lang="ts">
  import type { RateTopReviewItem } from '~/components/rate/TopReviews.vue'
  import type { LightNovelRate } from '~/features/light-novel/rate'
  import { useLightNovelRate } from '~/features/light-novel/useLightNovelRate'
  import { getLightNovelTitle } from '~/utils/media/light-novel'
  import type { LightNovelPageData } from '~~/server/api/pages/light-novels/[id].get'

  defineOptions({ name: 'LightNovelRatesSummary' })
  const props = defineProps<{
    stats: LightNovelPageData['rate_stats']
    topRates: LightNovelPageData['top_rates']
    lightNovel: LightNovelPageData['light_novel']
    myRate: LightNovelRate | null
  }>()

  const lightNovelId = computed(() => props.lightNovel.id)
  const workTitle = computed(() => getLightNovelTitle(props.lightNovel))
  const rateCtl = useLightNovelRate(props.lightNovel.id, props.myRate)
  const dialogOpen = ref(false)

  const meta = computed(() => {
    const avg = props.stats.average
    const read = `${props.stats.played_count} 人读过`
    return avg == null ? read : `${read} · 平均 ${avg.toFixed(1)} / 10`
  })

  const statLine = computed(
    () => `${props.stats.rated_count} 条评分 · ${props.stats.status_counts.completed} 人读完`,
  )

  const reviews = computed<RateTopReviewItem[]>(() =>
    props.topRates.items
      .filter(r => r.rate != null && r.rate_content.trim())
      .slice(0, 6)
      .map(r => ({
        key: `${r.volume ? 'v' : 's'}${r.id}`,
        rater: r.rater,
        rate: r.rate,
        content: r.rate_content,
        isSpoiler: r.is_spoiler,
        badge: r.volume
          ? r.volume.volume_number != null
            ? `第 ${r.volume.volume_number} 卷`
            : r.volume.name_cn || r.volume.name || '分卷'
          : undefined,
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
    :to="`/light-novels/${lightNovelId}/rates`"
  >
    <template #action>
      <Button login-required size="sm" variant="soft" @click="dialogOpen = true">
        我来写第一条！
      </Button>
      <LightNovelRateDialog
        v-model:visible="dialogOpen"
        :light-novel-id="lightNovelId"
        :rate="rateCtl.rate.value"
        :work-title="workTitle"
        :upsert="rateCtl.upsert"
        :remove="rateCtl.remove"
      />
    </template>
  </RateSummary>
</template>
