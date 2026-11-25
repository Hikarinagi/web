<script setup lang="ts">
  import type { PersonComparisonPageData } from '~~/server/api/pages/people/[id]/revisions/compare.get'

  definePageMeta({ container: 'full' })

  const route = useRoute()
  const personId = Number(route.params.id)

  const { data } = await useHikariApiData<PersonComparisonPageData>(
    () =>
      `/api/pages/people/${personId}/revisions/compare?from=${route.query.from}&to=${route.query.to}`,
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
    resource="person"
    :resource-id="personId"
    :title="data.title"
    :comparison="data.comparison"
  />
</template>
