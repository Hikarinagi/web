<script setup lang="ts">
  import {
    Button,
    DescriptionDetails,
    DescriptionList,
    DescriptionTerm,
    Inline,
    Panel,
    Text,
  } from '@hina-ui/vue'
  import { timeFormat } from '#imports'
  import { Lock, Pencil, Shield, Trash2 } from '@lucide/vue'
  import type { BackendPermissionGroup } from '~/features/creator/governance'

  const props = defineProps<{ group: BackendPermissionGroup }>()
  const emit = defineEmits<{ updated: []; deleted: [] }>()

  const editOpen = ref(false)
  const deleting = ref(false)
  const { confirm } = useHikariConfirm()

  async function performDelete() {
    if (deleting.value) return
    deleting.value = true
    try {
      await hikariRequest<'/api/v3/permission-groups/{id}', 'delete'>(
        '/api/v3/permission-groups/{id}',
        {
          method: 'DELETE',
          path: { id: props.group.id },
        },
      )
      emit('deleted')
    } finally {
      deleting.value = false
    }
  }

  function confirmDelete() {
    confirm({
      title: '删除权限组',
      description: `确认删除「${props.group.name}」？此操作不可撤销，组内成员会被同时移除。`,
      confirmText: '删除',
      cancelText: '取消',
      tone: 'danger',
      onConfirm: () => performDelete(),
    })
  }
</script>

<template>
  <Panel title="基本信息">
    <template #icon><Shield /></template>
    <template #actions>
      <Inline gap="sm" align="center" :wrap="false">
        <Button
          variant="ghost"
          tone="neutral"
          size="sm"
          :disabled="group.is_system"
          @click="editOpen = true"
        >
          <template #icon><Pencil /></template>
          编辑
        </Button>
        <Button
          variant="ghost"
          tone="danger"
          size="sm"
          :disabled="group.is_system"
          @click="confirmDelete"
        >
          <template #icon><Trash2 /></template>
          删除
        </Button>
      </Inline>
    </template>
    <DescriptionList>
      <DescriptionTerm>名称</DescriptionTerm>
      <DescriptionDetails>
        <Inline gap="xs" align="center" :wrap="false">
          <Text as="span" weight="medium">{{ group.name }}</Text>
          <Lock
            v-if="group.is_system"
            v-tooltip="'系统权限组，不可编辑'"
            class="size-3.5 shrink-0 text-muted"
          />
        </Inline>
      </DescriptionDetails>

      <DescriptionTerm>描述</DescriptionTerm>
      <DescriptionDetails>{{ group.description || '—' }}</DescriptionDetails>

      <DescriptionTerm>权限数</DescriptionTerm>
      <DescriptionDetails>{{ group.permissions.length }} 项</DescriptionDetails>

      <DescriptionTerm>创建</DescriptionTerm>
      <DescriptionDetails>
        {{ timeFormat(group.created_at) }}
        <template v-if="group.created_by">
          ·
          <UserName :user="group.created_by" class="inline-flex" />
        </template>
      </DescriptionDetails>

      <DescriptionTerm>最近更新</DescriptionTerm>
      <DescriptionDetails>{{ timeFormat(group.updated_at) }}</DescriptionDetails>
    </DescriptionList>
  </Panel>

  <CreatorGovernanceGroupsEditDialog
    v-model:visible="editOpen"
    :group="group"
    @updated="emit('updated')"
  />
</template>
