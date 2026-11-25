<script setup lang="ts">
  import type { PersonHistoryPageData } from '~~/server/api/pages/people/[id]/revisions/index.get'
  import { useHistoryPage } from '~/features/entry/useHistoryPage'

  definePageMeta({ container: 'full' })

  const route = useRoute()
  const personId = Number(route.params.id)

  const { data, page, pending } = await useHistoryPage<PersonHistoryPageData>(`people/${personId}`)
  await redirectIfMerged(data)

  useHikariSeoMeta({
    title: () => (data.value ? [data.value.title, '修订历史'] : '修订历史'),
    type: 'profile',
  })
</script>

<template>
  <EntryHistoryList
    v-if="data"
    v-model:page="page"
    resource="person"
    :resource-id="personId"
    :title="data.title"
    :subtitle="data.subtitle"
    :history="data.history"
    :loading="pending"
  />
</template>
