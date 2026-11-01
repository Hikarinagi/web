<script setup lang="ts">
  import type { EntryHistoryPageData } from '~~/server/api/pages/create/edit/entry/[id]/history.get'

  definePageMeta({ title: '修订历史', middleware: 'wiki-editor-content-limit' })

  const route = useRoute()
  const id = Number(route.params.id)
  const page = ref(Number(route.query.page) || 1)

  const { data, pending, refresh } = await useHikariApiData<EntryHistoryPageData>(
    () => `/api/pages/create/edit/entry/${id}/history?page=${page.value}`,
    { fatal: true },
  )
</script>

<template>
  <CreatorEntryHistory
    v-if="data"
    v-model:page="page"
    :title="data.entry.label"
    :edit-to="`/create/edit/entry/${id}`"
    :history="data.history"
    :loading="pending"
    :revision-to="
      revision =>
        revision > 1 ? `/create/edit/entry/${id}/compare?from=${revision - 1}&to=${revision}` : null
    "
    :compare-to="(from, to) => `/create/edit/entry/${id}/compare?from=${from}&to=${to}`"
    @changed="refresh()"
  />
</template>
