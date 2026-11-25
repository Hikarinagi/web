<script setup lang="ts">
  import type { LightNovelComparisonPageData } from '~~/server/api/pages/light-novels/[id]/revisions/compare.get'

  definePageMeta({
    container: 'full',
  })

  const route = useRoute()
  const lightNovelId = Number(route.params.id)

  const { data } = await useHikariApiData<LightNovelComparisonPageData>(
    () =>
      `/api/pages/light-novels/${lightNovelId}/revisions/compare?from=${route.query.from}&to=${route.query.to}`,
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
    resource="light-novel"
    :resource-id="lightNovelId"
    :title="data.title"
    :comparison="data.comparison"
  />
</template>
