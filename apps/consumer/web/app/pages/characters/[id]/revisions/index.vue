<script setup lang="ts">
  import type { CharacterHistoryPageData } from '~~/server/api/pages/characters/[id]/revisions/index.get'
  import { useHistoryPage } from '~/features/entry/useHistoryPage'

  definePageMeta({ container: 'full' })

  const route = useRoute()
  const characterId = Number(route.params.id)

  const { data, page, pending } = await useHistoryPage<CharacterHistoryPageData>(
    `characters/${characterId}`,
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
    resource="character"
    :resource-id="characterId"
    :title="data.title"
    :subtitle="data.subtitle"
    :history="data.history"
    :loading="pending"
  />
</template>
