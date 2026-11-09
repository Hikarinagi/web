<script setup lang="ts">
  import type { WorkbenchPageData } from '~~/server/api/pages/create/wiki/index.get'

  definePageMeta({
    layout: 'creator',
    middleware: 'auth',
    floatingToolbar: false,
    title: '维基工作台',
    fill: true,
  })

  const { data, error, status, refresh } =
    useHikariApiData<WorkbenchPageData>('/api/pages/create/wiki')
  useRefreshOnSaved(refresh)
  useCreatorPage({
    title: '维基工作台',
    crumbs: [{ label: '维基工作台', to: '/create/wiki' }],
    loading: () => status.value === 'pending',
  })
</script>

<template>
  <CreatorPageError v-if="error && !data" :error="error" @retry="refresh()" />
  <WikiHomeBoard v-else-if="data" :data="data" />
</template>
