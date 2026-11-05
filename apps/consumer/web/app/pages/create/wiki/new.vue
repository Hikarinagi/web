<script setup lang="ts">
  import type { NewEntryPageData } from '~~/server/api/pages/create/wiki/new.get'

  definePageMeta({ title: '新建条目', middleware: 'wiki-editor-content-limit' })
  useCreatorPage({ title: '新建条目', crumbs: [{ label: '新建条目' }] })

  const { data } = await useHikariApiData<NewEntryPageData>('/api/pages/create/wiki/new', {
    fatal: true,
  })
</script>

<template>
  <WikiNewEntry v-if="data" :definitions="data.definitions" />
</template>
