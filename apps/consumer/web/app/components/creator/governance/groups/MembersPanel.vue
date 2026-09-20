<script setup lang="ts">
  import { timeFormat } from '#imports'
  import { Plus, Users, X } from '@lucide/vue'
  import type { BackendPermissionGroupMemberList } from '~/features/creator/governance'
  import { displayName } from '~/utils/user'

  const props = defineProps<{ groupId: number; list?: BackendPermissionGroupMemberList }>()
  const emit = defineEmits<{ changed: [] }>()

  const confirm = useConfirm()
  const addOpen = ref(false)
  const removing = ref<number | null>(null)

  async function removeMember(userId: number, name: string, close?: () => void) {
    if (removing.value !== null) return
    removing.value = userId
    try {
      await hikariRequest('/api/v3/permission-groups/{id}/members/{user_id}', {
        method: 'DELETE',
        path: { id: props.groupId, user_id: userId },
      })
      close?.()
      emit('changed')
    } finally {
      removing.value = null
    }
    void name
  }

  function confirmRemove(userId: number, name: string) {
    confirm.require({
      group: 'app-shell',
      header: '移除成员',
      message: `确认将 ${name} 从该权限组移除？`,
      acceptLabel: '移除',
      rejectLabel: '取消',
      closeOnEscape: false,
      loading: () => removing.value === userId,
      onAccept: ({ close }) => void removeMember(userId, name, close).catch(() => {}),
    })
  }
</script>

<template>
  <CardPanel title="成员" :icon="Users" :count="list?.meta.total_items ?? 0">
    <template #actions>
      <Button label="添加" size="small" @click="addOpen = true">
        <template #icon>
          <Plus :size="15" />
        </template>
      </Button>
    </template>
    <CreatorEmpty v-if="!list?.items.length" text="还没有成员" />
    <ul v-else class="flex flex-col divide-y divide-surface-200 dark:divide-surface-800">
      <li v-for="member in list.items" :key="member.id" class="flex items-center gap-3 py-3">
        <Avatar
          :user="member.user"
          card
          shape="circle"
          class="size-9! shrink-0 bg-surface-200 text-sm font-medium dark:bg-surface-700"
        />
        <div class="min-w-0 flex-1">
          <UserName :user="member.user" class="text-sm font-medium" />
          <p class="text-xs text-muted-color">
            加入于 {{ timeFormat(member.created_at) }}
            <template v-if="member.granted_by">
              · 由
              <UserName :user="member.granted_by" :handle="false" class="text-xs" />
              添加
            </template>
          </p>
        </div>
        <Button
          v-tooltip.top="'移除'"
          unstyled
          aria-label="移除成员"
          class="inline-flex size-8 items-center justify-center rounded text-muted-color transition-colors hover:bg-surface-100 hover:text-red-500 dark:hover:bg-surface-800"
          :disabled="removing !== null"
          @click="confirmRemove(member.user.id, displayName(member.user))"
        >
          <template #icon>
            <X :size="15" />
          </template>
        </Button>
      </li>
    </ul>
  </CardPanel>

  <CreatorGovernanceGroupsAddMemberDialog
    v-model:visible="addOpen"
    :group-id="groupId"
    @added="emit('changed')"
  />
</template>
