<script setup lang="ts">
  import type { WorkbenchPageData } from '~~/server/api/pages/create/wiki/index.get'

  definePageMeta({ title: '维基工作台' })
  useCreatorPage({ title: '维基工作台', crumbs: [{ label: '维基工作台', to: '/create/wiki' }] })

  const { data } = await useHikariApiData<WorkbenchPageData>('/api/pages/create/wiki', {
    fatal: true,
  })
</script>

<template>
  <WikiHomeBoard v-if="data" :data="data" />
</template>
