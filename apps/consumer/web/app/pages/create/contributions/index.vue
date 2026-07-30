<script setup lang="ts">
  import type { CreatorContributionsPageData } from '~~/server/api/pages/create/contributions.get'

  definePageMeta({ title: '变更请求' })

  const page = ref(1)
  const status = ref<string>()

  const requestUrl = computed<`/api/pages/${string}`>(() => {
    const params = new URLSearchParams({ page: String(page.value) })
    if (status.value) params.set('status', status.value)
    return `/api/pages/create/contributions?${params.toString()}`
  })

  const { data, pending } = await useHikariApiData<CreatorContributionsPageData>(requestUrl, {
    fatal: true,
  })
</script>

<template>
  <CreatorContributionTable
    v-model:page="page"
    v-model:status="status"
    :list="data?.contributions"
    :loading="pending"
  />
</template>
