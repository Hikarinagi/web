<script setup lang="ts">
  import { BookAlert } from '@lucide/vue'
  import { WORKBENCH_PERMISSIONS } from '@hikarinagi/shared'
  import type { WorkbenchMangaHeldPageData } from '~~/server/api/pages/create/manga-held.get'

  definePageMeta({
    layout: 'creator',
    floatingToolbar: false,
    title: '已暂停的漫画投稿',
    middleware: ['auth', 'creator-permission'],
    requiredPermission: WORKBENCH_PERMISSIONS.REVIEW_MANGA,
  })

  const page = ref(1)
  const requestUrl = computed<`/api/pages/${string}`>(
    () => `/api/pages/create/manga-held?page=${page.value}`,
  )
  const { data, error, pending, refresh } = useHikariApiData<WorkbenchMangaHeldPageData>(requestUrl)
  useCreatorPage({ loading: () => pending.value && !data.value })
</script>

<template>
  <CreatorPageError v-if="error && !data" :error="error" @retry="refresh()" />
  <WorkbenchMangaProjectTable
    v-else-if="data"
    v-model:page="page"
    purpose="held"
    title="已暂停的漫画投稿"
    :icon="BookAlert"
    :list="data.projects"
    :loading="pending"
    empty-text="没有已暂停的投稿"
    @changed="refresh"
  />
</template>
