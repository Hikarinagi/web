<script setup lang="ts">
  import type { ContributePageData } from '~~/server/api/pages/contribute.get'

  definePageMeta({
    layout: 'creator',
    middleware: 'auth',
    floatingToolbar: false,
    title: '发起投稿',
  })

  const { data, error, status, refresh } =
    useHikariApiData<ContributePageData>('/api/pages/contribute')
  useCreatorPage({ loading: () => status.value === 'pending' })
</script>

<template>
  <CreatorPageError v-if="error && !data" :error="error" @retry="refresh()" />
  <CreatorSubmissionLauncher v-else-if="data" :data="data" />
</template>
