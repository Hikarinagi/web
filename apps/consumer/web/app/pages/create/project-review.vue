<script setup lang="ts">
  import { BookCheck } from '@lucide/vue'
  import { WORKBENCH_PERMISSIONS } from '@hikarinagi/shared'
  import type { WorkbenchReviewPageData } from '~~/server/api/pages/create/project-review.get'

  definePageMeta({
    title: '小说投稿审核',
    middleware: 'creator-permission',
    requiredPermission: WORKBENCH_PERMISSIONS.REVIEW_NOVEL,
  })

  const page = ref(1)
  const requestUrl = computed<`/api/pages/${string}`>(
    () => `/api/pages/create/project-review?page=${page.value}`,
  )
  const { data, pending } = await useHikariApiData<WorkbenchReviewPageData>(requestUrl, {
    fatal: true,
  })
</script>

<template>
  <WorkbenchProjectTable
    v-if="data"
    v-model:page="page"
    purpose="review"
    title="待审核的小说投稿"
    :icon="BookCheck"
    :list="data.projects"
    :loading="pending"
    empty-text="没有待审核的投稿"
  />
</template>
