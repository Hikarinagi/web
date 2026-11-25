<script setup lang="ts">
  import type { MangaVolumeHistoryPageData } from '~~/server/api/pages/manga-volumes/[id]/revisions/index.get'
  import { useHistoryPage } from '~/features/entry/useHistoryPage'

  definePageMeta({
    container: 'full',
  })

  const route = useRoute()
  const volumeId = Number(route.params.id)

  const { data, page, pending } = await useHistoryPage<MangaVolumeHistoryPageData>(
    `manga-volumes/${volumeId}`,
  )
  await redirectIfMerged(data)

  useHikariSeoMeta({
    title: () => (data.value ? [data.value.title, '修订历史'] : '修订历史'),
  })
</script>

<template>
  <EntryHistoryList
    v-if="data"
    v-model:page="page"
    resource="manga-volume"
    :resource-id="volumeId"
    :title="data.title"
    :subtitle="data.subtitle"
    :history="data.history"
    :loading="pending"
  />
</template>
