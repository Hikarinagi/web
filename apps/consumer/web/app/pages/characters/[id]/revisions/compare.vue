<script setup lang="ts">
  import type { CharacterComparisonPageData } from '~~/server/api/pages/characters/[id]/revisions/compare.get'

  definePageMeta({ container: 'full' })

  const route = useRoute()
  const characterId = Number(route.params.id)

  const { data } = await useHikariApiData<CharacterComparisonPageData>(
    () =>
      `/api/pages/characters/${characterId}/revisions/compare?from=${route.query.from}&to=${route.query.to}`,
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
    resource="character"
    :resource-id="characterId"
    :title="data.title"
    :comparison="data.comparison"
  />
</template>
