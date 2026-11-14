<script setup lang="ts">
  import { Empty, Grid, Heading, Inline, SegmentedControl, Stack, Text } from '@hina-ui/vue'
  import { RANKING_PERIODS, rangeText, type RankingPeriod } from '~/features/ranking/ranking'

  defineOptions({ name: 'RankingShell' })
  defineProps<{
    title: string
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
</script>

<template>
  <Stack gap="lg" class="mx-auto w-full max-w-(--entry-container) px-4 pt-5 pb-16 lg:px-6">
    <Inline gap="md" align="end" justify="between">
      <Stack gap="xs" class="min-w-0">
        <Heading :level="1" size="2xl">{{ title }}</Heading>
        <Inline gap="xs" align="center" :wrap="false">
          <Text size="sm" tone="muted" class="tabular-nums">{{ rangeText(from, to) }}</Text>
          <Question title="排名规则" aria-label="查看排名规则">
            按统计日期内浏览、收藏或阅读过作品的人数排名，同一个人只计一次。榜单每天 8:00
            更新，名次旁的箭头是与上一期相比的变化。
          </Question>
        </Inline>
      </Stack>
      <SegmentedControl
        :model-value="period"
        :options="RANKING_PERIODS"
        aria-label="榜单周期"
        @update:model-value="change"
      />
    </Inline>
    <Stack gap="none" class="relative">
      <Empty v-if="!count" title="这一期没有作品上榜" />
      <Grid
        v-else
        :cols="2"
        gap="none"
        class="gap-x-5 gap-y-7 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
      >
        <slot />
      </Grid>
      <LoadingOverlay :visible="pending" />
    </Stack>
  </Stack>
</template>
