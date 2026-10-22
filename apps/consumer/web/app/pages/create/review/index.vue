<script setup lang="ts">
  import type { CreatorReviewPageData } from '~~/server/api/pages/create/review.get'

  definePageMeta({ title: '变更请求审核' })

  const page = ref(1)
  const view = ref<'all' | 'disputed' | 'running' | 'bot'>('all')
  const requestUrl = computed<`/api/pages/${string}`>(() => {
    const query = new URLSearchParams({ page: String(page.value) })
    if (view.value !== 'all') query.set('view', view.value)
    return `/api/pages/create/review?${query.toString()}`
  })
  const { data, pending } = await useHikariApiData<CreatorReviewPageData>(requestUrl, {
    fatal: true,
  })
</script>

<template>
  <CreatorReviewQueue
    v-model:page="page"
    v-model:view="view"
    :list="data?.pending"
    :counts="data?.counts"
    :loading="pending"
  />
</template>
