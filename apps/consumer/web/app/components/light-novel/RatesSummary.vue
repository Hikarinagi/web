<script setup lang="ts">
  import { Card, Flex, Inline, Rating, Text } from '@hina-ui/vue'
  import type { LightNovelPageData } from '~~/server/api/pages/light-novels/[id].get'

  defineOptions({ name: 'LightNovelRatesSummary' })
  const props = defineProps<{
    stats: LightNovelPageData['rate_stats']
    topRates: LightNovelPageData['top_rates']
    lightNovelId: number
  }>()

  const meta = computed(() => {
    const avg = props.stats.average
    const read = `${props.stats.played_count} 人读过`
    return avg == null ? read : `${read} · 平均 ${avg.toFixed(1)} / 10`
  })
</script>

<template>
  <WorkSection
    title="安利墙"
    :meta="meta"
    :empty="stats.played_count === 0 && stats.rated_count === 0"
    empty-text="还没有人评分"
  >
    <Flex direction="col" gap="lg" class="lg:flex-row lg:items-start">
      <Card
        class="flex flex-col gap-3 rounded-xl lg:sticky lg:top-[calc(var(--app-header-height)+1.5rem)] lg:w-[220px] lg:shrink-0"
      >
        <Inline align="baseline" gap="none" class="gap-1">
          <Text as="span" class="text-5xl leading-none font-bold tabular-nums">
            {{ stats.average != null ? stats.average.toFixed(1) : '—' }}
          </Text>
          <Text as="span" size="sm" tone="muted">/ 10</Text>
        </Inline>

        <Rating :model-value="stats.average ?? 0" :max="10" readonly size="sm" />

        <Text size="xs" tone="muted">
          {{ stats.rated_count }} 条评分 · {{ stats.status_counts.completed }} 人读完
        </Text>
      </Card>

      <LightNovelRatesTopReviews
        :rates="topRates.items"
        :total="stats.content_count"
        :light-novel-id="lightNovelId"
      />
    </Flex>
  </WorkSection>
</template>
