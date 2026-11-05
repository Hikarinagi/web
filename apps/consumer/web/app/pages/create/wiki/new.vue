<script setup lang="ts">
  import type { NewEntryPageData } from '~~/server/api/pages/create/wiki/new.get'

  definePageMeta({
    layout: 'creator',
    middleware: ['auth', 'wiki-editor-content-limit'],
    floatingToolbar: false,
    title: '新建条目',
    fill: true,
  })

  const { data, error, status, refresh } = useHikariApiData<NewEntryPageData>(
    '/api/pages/create/wiki/new',
  )
  useCreatorPage({
    title: '新建条目',
    crumbs: [{ label: '新建条目' }],
    loading: () => status.value === 'pending',
  })
</script>

<template>
  <CreatorPageError v-if="error && !data" :error="error" @retry="refresh()" />
  <WikiNewEntry v-else-if="data" :definitions="data.definitions" />
</template>
