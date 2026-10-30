<script setup lang="ts">
  import type { CreatorNewPageData } from '~~/server/api/pages/create/new.get'

  definePageMeta({ title: '新建条目', middleware: 'wiki-editor-content-limit' })

  const { data } = await useHikariApiData<CreatorNewPageData>('/api/pages/create/new', {
    fatal: true,
  })
</script>

<template>
  <CreatorNewWorkflow v-if="data" :definitions="data.definitions" />
</template>
