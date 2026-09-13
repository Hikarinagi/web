<script setup lang="ts">
  import { KeyRound } from '@lucide/vue'
  import type { BackendPermissionCatalog } from '~/features/creator/governance'

  defineProps<{
    permissions: readonly string[]
    catalog: BackendPermissionCatalog
  }>()
</script>

<template>
  <CardPanel
    title="权限"
    :icon="KeyRound"
    :count="permissions.length"
    description="该组当前授予的权限。编辑权限请使用上方的「编辑」按钮。"
  >
    <CreatorEmpty v-if="permissions.length === 0" text="还没有授予任何权限" />
    <div v-else class="rounded-md ring-1 ring-surface-200 dark:ring-surface-700">
      <CreatorGovernancePermissionTree
        :entries="catalog.permissions"
        :model-value="[...permissions]"
        readonly
      />
    </div>
  </CardPanel>
</template>
