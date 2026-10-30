<script setup lang="ts">
  import { WORKBENCH_PERMISSIONS } from '@hikarinagi/shared'
  import type { MangaReviewPageData } from '~~/server/api/pages/create/manga-review/[id].get'

  definePageMeta({
    layout: 'workbench',
    middleware: 'creator-permission',
    requiredPermission: WORKBENCH_PERMISSIONS.REVIEW_MANGA,
  })

  const route = useRoute()
  const { data, refresh } = await useHikariApiData<MangaReviewPageData>(
    () => `/api/pages/create/manga-review/${Number(route.params.id)}`,
    { fatal: true },
  )
</script>

<template>
  <WorkbenchMangaReviewWorkspace v-if="data" :data="data" @refresh="refresh" />
</template>
