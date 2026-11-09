<script setup lang="ts">
  import { Grid, Stack } from '@hina-ui/vue'
  import type { LandingRatio, LandingWork } from '~/features/landing/works'

  export interface LandingChartRow {
    work: LandingWork
    score?: number | null
    rated?: number
    note?: string
  }

  defineOptions({ name: 'LandingChart' })
  const props = withDefaults(
    defineProps<{
      rows: LandingChartRow[]
      ratio: LandingRatio
      start?: number
      columns?: 1 | 2 | 4
    }>(),
    { start: 1, columns: 2 },
  )

  const ranked = computed(() =>
    props.rows.map((row, index) => ({ ...row, rank: props.start + index })),
  )
  const tracks = computed(() => ({
    '--chart-rows-2': `repeat(${Math.ceil(props.rows.length / 2)}, auto)`,
    '--chart-rows-4': `repeat(${Math.ceil(props.rows.length / 4)}, auto)`,
  }))
</script>

<template>
  <Stack v-if="columns === 1" gap="none">
    <LandingRow v-for="row in ranked" :key="row.work.id" v-bind="row" :ratio="ratio" />
  </Stack>
  <Grid
    v-else
    gap="none"
    :style="tracks"
    :class="
      cn(
        'gap-x-6 sm:grid-flow-col sm:grid-cols-2 sm:grid-rows-(--chart-rows-2)',
        columns === 4 && 'lg:grid-cols-4 lg:grid-rows-(--chart-rows-4)',
      )
    "
  >
    <LandingRow v-for="row in ranked" :key="row.work.id" v-bind="row" :ratio="ratio" />
  </Grid>
</template>
