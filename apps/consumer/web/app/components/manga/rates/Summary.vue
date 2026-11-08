<script setup lang="ts">
  import type { RateTopReviewItem } from '~/components/rate/TopReviews.vue'
  import { useMangaRate } from '~/features/manga/useMangaRate'
  import { getMangaTitle } from '~/utils/media/manga'
  import type { MangaPageData } from '~~/server/api/pages/mangas/[id].get'

  defineOptions({ name: 'MangaRatesSummary' })
  const props = defineProps<{
    stats: MangaPageData['rate_stats']
    topRates: MangaPageData['top_rates']
    manga: MangaPageData['manga']
    myRate: MangaPageData['my_rate']
  }>()

  const mangaId = computed(() => props.manga.id)
  const workTitle = computed(() => getMangaTitle(props.manga))
  const rateCtl = useMangaRate(props.manga.id, props.myRate)
  const dialogOpen = ref(false)

  const meta = computed(() => {
    const avg = props.stats.average
    const read = `${props.stats.played_count} 人看过`
    return avg == null ? read : `${read} · 平均 ${avg.toFixed(1)} / 10`
  })

  const statLine = computed(
    () => `${props.stats.rated_count} 条评分 · ${props.stats.status_counts.completed} 人看完`,
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
    :to="`/mangas/${mangaId}/rates`"
  >
    <template #action>
      <Button login-required size="sm" variant="soft" @click="dialogOpen = true">
        我来写第一条！
      </Button>
      <MangaRateDialog
        v-model:visible="dialogOpen"
        :rate="rateCtl.rate.value"
        :work-title="workTitle"
        :upsert="rateCtl.upsert"
        :remove="rateCtl.remove"
      />
    </template>
  </RateSummary>
</template>
