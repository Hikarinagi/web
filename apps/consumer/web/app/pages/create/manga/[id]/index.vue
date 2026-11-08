<script setup lang="ts">
  import type { WorkbenchMangaProjectPageData } from '~~/server/api/pages/create/manga/[id].get'

  definePageMeta({ layout: 'workbench' })

  const route = useRoute()
  const { data, refresh } = await useHikariApiData<WorkbenchMangaProjectPageData>(
    () => `/api/pages/create/manga/${Number(route.params.id)}`,
    { fatal: true },
  )
</script>

<template>
  <WorkbenchMangaEditor v-if="data" :data="data" @refresh="refresh" />
</template>
