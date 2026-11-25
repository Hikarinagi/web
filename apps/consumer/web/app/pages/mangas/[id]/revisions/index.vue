<script setup lang="ts">
  import type { MangaHistoryPageData } from '~~/server/api/pages/mangas/[id]/revisions/index.get'
  import { useHistoryPage } from '~/features/entry/useHistoryPage'

  definePageMeta({
    container: 'full',
  })

  const route = useRoute()
  const mangaId = Number(route.params.id)

  const { data, page, pending } = await useHistoryPage<MangaHistoryPageData>(`mangas/${mangaId}`)
  await redirectIfMerged(data)

  useHikariSeoMeta({
    title: () => (data.value ? [data.value.title, '修订历史'] : '修订历史'),
  })
</script>

<template>
  <EntryHistoryList
    v-if="data"
    v-model:page="page"
    resource="manga"
    :resource-id="mangaId"
    :title="data.title"
    :subtitle="data.subtitle"
    :history="data.history"
    :loading="pending"
  />
</template>
