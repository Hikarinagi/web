<script setup lang="ts">
  import type { GalgameEditHistoryPageData } from '~~/server/api/pages/create/edit/galgame/[id]/history.get'

  definePageMeta({ title: '修订历史', middleware: 'wiki-editor-content-limit' })

  const route = useRoute()
  const id = Number(route.params.id)
  const page = ref(Number(route.query.page) || 1)

  const { data, pending, refresh } = await useHikariApiData<GalgameEditHistoryPageData>(
    () => `/api/pages/create/edit/galgame/${id}/history?page=${page.value}`,
    { fatal: true },
  )
  await redirectIfMerged(data)
</script>

<template>
  <CreatorEntryHistory
    v-if="data"
    v-model:page="page"
    :title="data.display.original_title ?? data.display.title"
    :edit-to="`/create/edit/galgame/${id}`"
    :history="data.history"
    :loading="pending"
    :revision-to="revision => `/galgames/${id}/revisions/${revision}`"
    :compare-to="(from, to) => `/galgames/${id}/revisions/compare?from=${from}&to=${to}`"
    @changed="refresh()"
  />
</template>
