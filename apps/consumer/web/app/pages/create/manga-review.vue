<script setup lang="ts">
  import { BookImage } from '@lucide/vue'
  import { WORKBENCH_PERMISSIONS } from '@hikarinagi/shared'
  import type { WorkbenchMangaReviewPageData } from '~~/server/api/pages/create/manga-review.get'

  definePageMeta({
    title: '漫画投稿审核',
    middleware: 'creator-permission',
    requiredPermission: WORKBENCH_PERMISSIONS.REVIEW_MANGA,
  })

  const page = ref(1)
  const requestUrl = computed<`/api/pages/${string}`>(
    () => `/api/pages/create/manga-review?page=${page.value}`,
  )
  const { data, pending } = await useHikariApiData<WorkbenchMangaReviewPageData>(requestUrl, {
    fatal: true,
  })
</script>

<template>
  <WorkbenchMangaProjectTable
    v-if="data"
    v-model:page="page"
    purpose="review"
    title="待审核的漫画投稿"
    :icon="BookImage"
    :list="data.projects"
    :loading="pending"
    empty-text="没有待审核的投稿"
  />
</template>
