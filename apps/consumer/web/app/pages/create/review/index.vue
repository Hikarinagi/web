<script setup lang="ts">
  import type { CreatorReviewPageData } from '~~/server/api/pages/create/review.get'

  definePageMeta({ title: '变更请求审核' })

  const page = ref(1)
  const check = ref<'all' | 'disputed' | 'running'>('all')
  const requestUrl = computed<`/api/pages/${string}`>(() => {
    const query = new URLSearchParams({ page: String(page.value) })
    if (check.value !== 'all') query.set('check', check.value)
    return `/api/pages/create/review?${query.toString()}`
  })
  const { data, pending } = await useHikariApiData<CreatorReviewPageData>(requestUrl, {
    fatal: true,
  })
</script>

<template>
  <CreatorReviewQueue
    v-model:page="page"
    v-model:check="check"
    :list="data?.pending"
    :counts="data?.counts"
    :loading="pending"
  />
</template>
