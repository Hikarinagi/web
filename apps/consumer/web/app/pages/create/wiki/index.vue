<script setup lang="ts">
  import type { WorkbenchPageData } from '~~/server/api/pages/create/wiki/index.get'

  definePageMeta({ title: '维基工作台', fill: true })
  useCreatorPage({ title: '维基工作台', crumbs: [{ label: '维基工作台', to: '/create/wiki' }] })

  const { data, refresh } = await useHikariApiData<WorkbenchPageData>('/api/pages/create/wiki', {
    fatal: true,
  })
  useRefreshOnSaved(refresh)
</script>

<template>
  <WikiHomeBoard v-if="data" :data="data" />
</template>
