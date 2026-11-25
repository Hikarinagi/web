<script setup lang="ts">
  import type { MangaComparisonPageData } from '~~/server/api/pages/mangas/[id]/revisions/compare.get'

  definePageMeta({
    container: 'full',
  })

  const route = useRoute()
  const mangaId = Number(route.params.id)

  const { data } = await useHikariApiData<MangaComparisonPageData>(
    () =>
      `/api/pages/mangas/${mangaId}/revisions/compare?from=${route.query.from}&to=${route.query.to}`,
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
    resource="manga"
    :resource-id="mangaId"
    :title="data.title"
    :comparison="data.comparison"
  />
</template>
