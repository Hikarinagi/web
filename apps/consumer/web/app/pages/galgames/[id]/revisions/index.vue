<script setup lang="ts">
  import type { GalgameHistoryPageData } from '~~/server/api/pages/galgames/[id]/revisions/index.get'

  definePageMeta({
    container: 'full',
  })

  const route = useRoute()
  const rawId = Array.isArray(route.params.id) ? route.params.id[0] : route.params.id
  const galgameId = Number(rawId)
  const page = ref(Number(route.query.page) || 1)

  const { data, pending } = await useHikariApiData<GalgameHistoryPageData>(
    () => `/api/pages/galgames/${galgameId}/revisions?page=${page.value}`,
    { fatal: true },
  )
  await redirectIfMerged(data)

  watch(
    () => route.query.page,
    raw => {
      const next = Number(Array.isArray(raw) ? raw[0] : raw) || 1
      if (page.value !== next) page.value = next
    },
  )

  useHikariSeoMeta({
    title: () => (data.value ? [data.value.display.title, '修订历史'] : '修订历史'),
  })
</script>

<template>
  <GalgameHistory
    v-if="data"
    v-model:page="page"
    :galgame-id="galgameId"
    :display="data.display"
    :history="data.history"
    :loading="pending"
  />
</template>
