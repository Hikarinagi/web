<script setup lang="ts">
  import type { LightNovelHistoryPageData } from '~~/server/api/pages/light-novels/[id]/revisions/index.get'
  import { useHistoryPage } from '~/features/entry/useHistoryPage'

  definePageMeta({
    container: 'full',
  })

  const route = useRoute()
  const lightNovelId = Number(route.params.id)

  const { data, page, pending } = await useHistoryPage<LightNovelHistoryPageData>(
    `light-novels/${lightNovelId}`,
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
    resource="light-novel"
    :resource-id="lightNovelId"
    :title="data.title"
    :subtitle="data.subtitle"
    :history="data.history"
    :loading="pending"
  />
</template>
