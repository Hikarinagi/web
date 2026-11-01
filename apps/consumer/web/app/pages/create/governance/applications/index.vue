<script setup lang="ts">
  import { ACCESS_PERMISSIONS } from '@hikarinagi/shared'
  import type { CreatorGovernanceApplicationsPageData } from '~~/server/api/pages/create/governance/applications.get'

  definePageMeta({
    title: '审核组申请',
    middleware: 'creator-permission',
    requiredPermission: ACCESS_PERMISSIONS.GROUP_MANAGE,
  })

  const page = ref(1)
  const status = ref<string>()

  const requestUrl = computed<`/api/pages/${string}`>(() => {
    const params = new URLSearchParams({ page: String(page.value) })
    if (status.value) params.set('status', status.value)
    return `/api/pages/create/governance/applications?${params.toString()}`
  })
  const { data, pending, refresh } = await useHikariApiData<CreatorGovernanceApplicationsPageData>(
    requestUrl,
    { fatal: true },
  )
</script>

<template>
  <CreatorGovernanceApplicationsTable
    v-model:page="page"
    v-model:status="status"
    :list="data?.applications"
    :loading="pending"
    @changed="refresh"
  />
</template>
