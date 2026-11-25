<script setup lang="ts">
  import type { GalgameComparisonPageData } from '~~/server/api/pages/galgames/[id]/revisions/compare.get'

  definePageMeta({
    container: 'full',
  })

  const route = useRoute()
  const galgameId = Number(route.params.id)

  const { data } = await useHikariApiData<GalgameComparisonPageData>(
    () =>
      `/api/pages/galgames/${galgameId}/revisions/compare?from=${route.query.from}&to=${route.query.to}`,
    { fatal: true },
  )
  await redirectIfMerged(data)

  useHikariSeoMeta({
    title: () => (data.value ? [data.value.display.title, '修订对比'] : '修订对比'),
  })
</script>

<template>
  <EntryHistoryComparison
    v-if="data"
    resource="galgame"
    :resource-id="galgameId"
    :title="data.display.title"
    :comparison="data.comparison"
  />
</template>
