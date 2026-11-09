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
  const props = defineProps<{
    rows: LandingChartRow[]
    ratio: LandingRatio
    start?: number
    wide?: boolean
  }>()

  const halves = computed(() => {
    const cut = Math.ceil(props.rows.length / 2)
    return [props.rows.slice(0, cut), props.rows.slice(cut)].map((rows, half) =>
      rows.map((row, index) => ({ ...row, rank: (props.start ?? 1) + half * cut + index })),
    )
  })
</script>

<template>
  <Grid v-if="wide" gap="none" class="gap-x-10 sm:grid-cols-2">
    <Stack v-for="(half, index) in halves" :key="index" gap="none">
      <LandingRow v-for="row in half" :key="row.work.id" v-bind="row" :ratio="ratio" />
    </Stack>
  </Grid>
  <Stack v-else gap="none">
    <LandingRow
      v-for="(row, index) in rows"
      :key="row.work.id"
      v-bind="row"
      :rank="(start ?? 1) + index"
      :ratio="ratio"
    />
  </Stack>
</template>
