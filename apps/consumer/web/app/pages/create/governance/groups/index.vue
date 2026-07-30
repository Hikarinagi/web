<script setup lang="ts">
  import { ACCESS_PERMISSIONS } from '@hikarinagi/shared'
  import type { CreatorGovernanceGroupsPageData } from '~~/server/api/pages/create/governance/groups.get'

  definePageMeta({
    title: '权限组',
    middleware: 'creator-permission',
    requiredPermission: ACCESS_PERMISSIONS.GROUP_MANAGE,
  })

  const page = ref(1)
  const requestUrl = computed<`/api/pages/${string}`>(
    () => `/api/pages/create/governance/groups?page=${page.value}`,
  )
  const { data, pending, refresh } = await useHikariApiData<CreatorGovernanceGroupsPageData>(
    requestUrl,
    { fatal: true },
  )
</script>

<template>
  <CreatorGovernanceGroupsTable
    v-model:page="page"
    :list="data?.groups"
    :loading="pending"
    @created="refresh"
  />
</template>
