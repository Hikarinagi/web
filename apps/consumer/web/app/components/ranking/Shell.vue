<script setup lang="ts">
  import { Empty, Heading, Inline, SegmentedControl, Stack, Text } from '@hina-ui/vue'
  import {
    RANKING_MEDIUMS,
    RANKING_PERIODS,
    rangeText,
    rankingRoute,
    type RankingMedium,
    type RankingPeriod,
  } from '~/features/ranking/ranking'

  defineOptions({ name: 'RankingShell' })
  const props = defineProps<{
    medium: RankingMedium
    period: RankingPeriod
    from: string
    to: string
    count: number
    pending?: boolean
  }>()
  const emit = defineEmits<{ update: [period: RankingPeriod] }>()

  function change(value: string | number | undefined) {
    const next = RANKING_PERIODS.find(option => option.value === value)
    if (next) emit('update', next.value)
  }

  function turn(value: string | number | undefined) {
    const next = RANKING_MEDIUMS.find(option => option.value === value)
    if (next && next.value !== props.medium) void navigateTo(rankingRoute(next.value, props.period))
  }
</script>

<template>
  <Stack gap="lg" class="mx-auto w-full max-w-(--ranking-container) px-4 pt-6 pb-16 lg:px-6">
    <Inline
      gap="md"
      align="end"
      justify="between"
      :wrap="false"
      class="max-md:flex-col max-md:items-stretch"
    >
      <Heading :level="1" class="w-(--ranking-logo) max-w-full shrink-0">
        <RankingLogo :medium="medium" :period="period" />
      </Heading>
      <Stack gap="sm" class="items-end max-md:items-stretch">
        <Inline gap="xs" align="center" :wrap="false">
          <Text size="sm" tone="muted" class="tabular-nums">{{ rangeText(from, to) }}</Text>
          <Question title="排名规则" aria-label="查看排名规则">
            按统计日期内浏览、收藏或阅读过作品的人数排名，同一个人只计一次。榜单每天 8:00
            更新，名次下方的箭头是与上一期相比的变化。
          </Question>
        </Inline>
        <Inline gap="sm" :wrap="false">
          <SegmentedControl
            :model-value="medium"
            :options="RANKING_MEDIUMS"
            aria-label="榜单类别"
            @update:model-value="turn"
          />
          <SegmentedControl
            :model-value="period"
            :options="RANKING_PERIODS"
            aria-label="榜单周期"
            @update:model-value="change"
          />
        </Inline>
      </Stack>
    </Inline>
    <Stack gap="none" class="relative gap-3">
      <Empty v-if="!count" title="这一期没有作品上榜" />
      <slot v-else />
      <LoadingOverlay :visible="pending" />
    </Stack>
  </Stack>
</template>
