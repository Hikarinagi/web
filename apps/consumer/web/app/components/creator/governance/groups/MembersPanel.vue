<script setup lang="ts">
  import { Button, IconButton, Inline, List, ListItem, Panel, Stack, Text } from '@hina-ui/vue'
  import { timeFormat } from '#imports'
  import { Plus, Users, X } from '@lucide/vue'
  import type { BackendPermissionGroupMemberList } from '~/features/creator/governance'
  import { displayName } from '~/utils/user'

  const props = defineProps<{ groupId: number; list?: BackendPermissionGroupMemberList }>()
  const emit = defineEmits<{ changed: [] }>()

  const { confirm } = useHikariConfirm()
  const addOpen = ref(false)
  const removing = ref<number | null>(null)

  async function removeMember(userId: number) {
    if (removing.value !== null) return
    removing.value = userId
    try {
      await hikariRequest('/api/v3/permission-groups/{id}/members/{user_id}', {
        method: 'DELETE',
        path: { id: props.groupId, user_id: userId },
      })
      emit('changed')
    } finally {
      removing.value = null
    }
  }

  function confirmRemove(userId: number, name: string) {
    confirm({
      title: '移除成员',
      description: `确认将 ${name} 从该权限组移除？`,
      confirmText: '移除',
      cancelText: '取消',
      tone: 'danger',
      onConfirm: () => removeMember(userId),
    })
  }
</script>

<template>
  <Panel title="成员" :count="list?.meta.total_items ?? 0">
    <template #icon><Users /></template>
    <template #actions>
      <Button size="sm" @click="addOpen = true">
        <template #icon><Plus /></template>
        添加
      </Button>
    </template>
    <CreatorEmpty v-if="!list?.items.length" text="还没有成员" />
    <List v-else class="divide-y divide-line">
      <ListItem v-for="member in list.items" :key="member.id">
        <Inline gap="sm" align="center" :wrap="false" class="py-3">
          <Avatar :user="member.user" card class="size-9! shrink-0" />
          <Stack gap="none" class="min-w-0 flex-1">
            <UserName :user="member.user" class="text-sm font-medium" />
            <Text size="xs" tone="muted">
              加入于 {{ timeFormat(member.created_at) }}
              <template v-if="member.granted_by">
                · 由
                <UserName :user="member.granted_by" :handle="false" class="text-xs" />
                添加
              </template>
            </Text>
          </Stack>
          <IconButton
            label="移除成员"
            tooltip
            variant="ghost"
            tone="danger"
            size="sm"
            class="shrink-0"
            :disabled="removing !== null"
            @click="confirmRemove(member.user.id, displayName(member.user))"
          >
            <X />
          </IconButton>
        </Inline>
      </ListItem>
    </List>
  </Panel>

  <CreatorGovernanceGroupsAddMemberDialog
    v-model:visible="addOpen"
    :group-id="groupId"
    @added="emit('changed')"
  />
</template>
