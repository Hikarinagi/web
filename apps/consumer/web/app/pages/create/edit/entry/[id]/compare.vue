<script setup lang="ts">
  import type { EntryComparisonPageData } from '~~/server/api/pages/create/edit/entry/[id]/compare.get'

  definePageMeta({ title: '修订对比', middleware: 'wiki-editor-content-limit' })

  const route = useRoute()
  const id = Number(route.params.id)
  const { data } = await useHikariApiData<EntryComparisonPageData>(
    () =>
      `/api/pages/create/edit/entry/${id}/compare?from=${route.query.from}&to=${route.query.to}`,
    { fatal: true },
  )
</script>

<template>
  <CreatorEntryComparison v-if="data" :page-data="data" />
</template>
