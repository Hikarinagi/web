<script setup lang="ts">
  import { Stack } from '@hina-ui/vue'
  import type { CreatorOverviewPageData } from '~~/server/api/pages/create/overview.get'

  definePageMeta({ title: '概览' })

  const { data } = await useHikariApiData<CreatorOverviewPageData>('/api/pages/create/overview', {
    fatal: true,
  })
</script>

<template>
  <Stack gap="md">
    <CreatorContributionStatsHeatmap v-if="data" :stats="data.stats" />
    <CreatorReviewQueueSection :entries="data?.review_entries" />
    <CreatorContributionPendingSection :list="data?.pending" />
    <CreatorContributionActivityFeed :initial-items="data?.activity ?? []" />
  </Stack>
</template>
