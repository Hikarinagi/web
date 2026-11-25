<script setup lang="ts">
  import type { GalgameHistoryPageData } from '~~/server/api/pages/galgames/[id]/revisions/index.get'
  import { useHistoryPage } from '~/features/entry/useHistoryPage'

  definePageMeta({
    container: 'full',
  })

  const route = useRoute()
  const galgameId = Number(route.params.id)

  const { data, page, pending } = await useHistoryPage<GalgameHistoryPageData>(
    `galgames/${galgameId}`,
  )
  await redirectIfMerged(data)

  useHikariSeoMeta({
    title: () => (data.value ? [data.value.display.title, '修订历史'] : '修订历史'),
  })
</script>

<template>
  <EntryHistoryList
    v-if="data"
    v-model:page="page"
    resource="galgame"
    :resource-id="galgameId"
    :title="data.display.title"
    :subtitle="data.display.original_title"
    :history="data.history"
    :loading="pending"
    snapshots
  />
</template>
