<script setup lang="ts">
  import { Card, Flex, Inline, Rating, Text } from '@hina-ui/vue'
  import type { RateTopReviewItem } from './TopReviews.vue'

  defineOptions({ name: 'RateSummary' })
  defineProps<{
    meta: string
    empty: boolean
    average: number | null
    statLine: string
    reviews: RateTopReviewItem[]
    total: number
    to: string
  }>()
</script>

<template>
  <WorkSection title="安利墙" :meta="meta" :empty="empty" empty-text="还没有人评分">
    <Flex direction="col" gap="lg" class="lg:flex-row lg:items-start">
      <Card
        class="flex flex-col gap-3 rounded-xl lg:sticky lg:top-[calc(var(--app-header-height)+1.5rem)] lg:w-55 lg:shrink-0"
      >
        <Inline gap="xs" align="baseline" :wrap="false">
          <Text as="span" class="text-5xl leading-none font-bold tabular-nums">
            {{ average != null ? average.toFixed(1) : '—' }}
          </Text>
          <Text as="span" size="sm" tone="muted">/ 10</Text>
        </Inline>
        <Rating :model-value="average ?? 0" :max="10" readonly size="sm" />
        <Text as="p" size="xs" tone="muted">{{ statLine }}</Text>
      </Card>

      <RateTopReviews :reviews="reviews" :total="total" :to="to">
        <template v-if="$slots.action" #action><slot name="action" /></template>
      </RateTopReviews>
    </Flex>
  </WorkSection>
</template>
