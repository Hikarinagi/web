<script setup lang="ts">
  import type { ProducerHistoryPageData } from '~~/server/api/pages/producers/[id]/revisions/index.get'
  import { useHistoryPage } from '~/features/entry/useHistoryPage'

  definePageMeta({ container: 'full' })

  const route = useRoute()
  const producerId = Number(route.params.id)

  const { data, page, pending } = await useHistoryPage<ProducerHistoryPageData>(
    `producers/${producerId}`,
  )
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
    resource="producer"
    :resource-id="producerId"
    :title="data.title"
    :subtitle="data.subtitle"
    :history="data.history"
    :loading="pending"
  />
</template>
