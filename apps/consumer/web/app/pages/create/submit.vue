<script setup lang="ts">
  import type { ContributePageData } from '~~/server/api/pages/contribute.get'

  definePageMeta({ title: '发起投稿' })

  const { data } = await useHikariApiData<ContributePageData>('/api/pages/contribute', {
    fatal: true,
  })
</script>

<template>
  <CreatorSubmissionLauncher v-if="data" :data="data" />
</template>
