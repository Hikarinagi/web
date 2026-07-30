<script setup lang="ts">
  import type { CreatorReviewPageData } from '~~/server/api/pages/create/review.get'

  definePageMeta({ title: '审核队列' })

  const page = ref(1)
  const requestUrl = computed<`/api/pages/${string}`>(
    () => `/api/pages/create/review?page=${page.value}`,
  )
  const { data, pending } = await useHikariApiData<CreatorReviewPageData>(requestUrl, {
    fatal: true,
  })
</script>

<template>
  <CreatorReviewQueue v-model:page="page" :list="data?.pending" :loading="pending" />
</template>
