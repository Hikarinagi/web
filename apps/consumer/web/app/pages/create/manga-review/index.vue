<script setup lang="ts">
  import { BookImage } from '@lucide/vue'
  import { WORKBENCH_PERMISSIONS } from '@hikarinagi/shared'
  import type { WorkbenchMangaReviewPageData } from '~~/server/api/pages/create/manga-review.get'

  definePageMeta({
    layout: 'creator',
    floatingToolbar: false,
    title: '漫画投稿审核',
    middleware: ['auth', 'creator-permission'],
    requiredPermission: WORKBENCH_PERMISSIONS.REVIEW_MANGA,
  })

  const page = ref(1)
  const requestUrl = computed<`/api/pages/${string}`>(
    () => `/api/pages/create/manga-review?page=${page.value}`,
  )
  const { data, error, pending, refresh } =
    useHikariApiData<WorkbenchMangaReviewPageData>(requestUrl)
  useCreatorPage({ loading: () => pending.value && !data.value })
</script>

<template>
  <CreatorPageError v-if="error && !data" :error="error" @retry="refresh()" />
  <WorkbenchMangaProjectTable
    v-else-if="data"
    v-model:page="page"
    purpose="review"
    title="待审核的漫画投稿"
    :icon="BookImage"
    :list="data.projects"
    :loading="pending"
    empty-text="没有待审核的投稿"
    @changed="refresh"
  />
</template>
