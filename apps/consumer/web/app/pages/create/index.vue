<script setup lang="ts">
  import { Stack } from '@hina-ui/vue'
  import type { CreatorOverviewPageData } from '~~/server/api/pages/create/overview.get'

  definePageMeta({ title: '概览' })

  const { data } = await useHikariApiData<CreatorOverviewPageData>('/api/pages/create/overview', {
    fatal: true,
  })
</script>

<template>
  <Stack v-if="data" gap="lg">
    <CreatorReviewQueueSection :counts="data.review_counts" />
    <CreatorProjectSection :novels="data.novels" :mangas="data.mangas" />
    <CreatorContributionPendingSection :list="data.pending" />
    <CreatorContributionStatsHeatmap :stats="data.stats" />
    <CreatorContributionActivityFeed :initial-items="data.activity" />
  </Stack>
</template>
