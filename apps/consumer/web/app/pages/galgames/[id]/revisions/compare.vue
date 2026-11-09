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
  <GalgameHistoryComparison
    v-if="data"
    :galgame-id="galgameId"
    :display="data.display"
    :comparison="data.comparison"
  />
</template>
