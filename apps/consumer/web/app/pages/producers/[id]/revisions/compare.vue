<script setup lang="ts">
  import type { ProducerComparisonPageData } from '~~/server/api/pages/producers/[id]/revisions/compare.get'

  definePageMeta({ container: 'full' })

  const route = useRoute()
  const producerId = Number(route.params.id)

  const { data } = await useHikariApiData<ProducerComparisonPageData>(
    () =>
      `/api/pages/producers/${producerId}/revisions/compare?from=${route.query.from}&to=${route.query.to}`,
    { fatal: true },
  )
  await redirectIfMerged(data)

  useHikariSeoMeta({
    title: () => (data.value ? [data.value.title, '修订对比'] : '修订对比'),
    type: 'profile',
  })
</script>

<template>
  <EntryHistoryComparison
    v-if="data"
    resource="producer"
    :resource-id="producerId"
    :title="data.title"
    :comparison="data.comparison"
  />
</template>
