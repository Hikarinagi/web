<script setup lang="ts">
  import { ACCESS_PERMISSIONS } from '@hikarinagi/shared'
  import type { CreatorGovernanceGroupPageData } from '~~/server/api/pages/create/governance/groups/[id].get'

  definePageMeta({
    title: '权限组',
    middleware: 'creator-permission',
    requiredPermission: ACCESS_PERMISSIONS.GROUP_MANAGE,
  })

  const route = useRoute()
  const groupId = computed(() => Number(route.params.id))

  const requestUrl = computed<`/api/pages/${string}`>(
    () => `/api/pages/create/governance/groups/${groupId.value}`,
  )
  const { data, refresh } = await useHikariApiData<CreatorGovernanceGroupPageData>(requestUrl, {
    fatal: true,
  })

  const { subtitle } = useCreatorTopbar()
  watchEffect(() => {
    subtitle.value = data.value?.group.name ?? null
  })
  onBeforeUnmount(() => {
    subtitle.value = null
  })

  function afterDelete() {
    void navigateTo('/create/governance/groups')
  }
</script>

<template>
  <div v-if="data" class="flex flex-col gap-5">
    <CreatorGovernanceGroupsInfoPanel
      :group="data.group"
      @updated="refresh"
      @deleted="afterDelete"
    />
    <CreatorGovernanceGroupsPermissionsPanel
      :permissions="data.group.permissions"
      :catalog="data.catalog"
    />
    <CreatorGovernanceGroupsMembersPanel
      :group-id="data.group.id"
      :list="data.members"
      @changed="refresh"
    />
  </div>
</template>
