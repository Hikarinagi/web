<script setup lang="ts">
  import type { LightNovelVolumeComparisonPageData } from '~~/server/api/pages/light-novel-volumes/[id]/revisions/compare.get'

  definePageMeta({
    container: 'full',
  })

  const route = useRoute()
  const volumeId = Number(route.params.id)

  const { data } = await useHikariApiData<LightNovelVolumeComparisonPageData>(
    () =>
      `/api/pages/light-novel-volumes/${volumeId}/revisions/compare?from=${route.query.from}&to=${route.query.to}`,
    { fatal: true },
  )
  await redirectIfMerged(data)

  useHikariSeoMeta({
    title: () => (data.value ? [data.value.title, '修订对比'] : '修订对比'),
  })
</script>

<template>
  <EntryHistoryComparison
    v-if="data"
    resource="light-novel-volume"
    :resource-id="volumeId"
    :title="data.title"
    :comparison="data.comparison"
  />
</template>
