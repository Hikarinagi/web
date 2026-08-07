<script setup lang="ts">
  import { timeFormat } from '#imports'
  import { Lock, Pencil, Shield, Trash2 } from '@lucide/vue'
  import type { BackendPermissionGroup } from '~/features/creator/governance'

  const props = defineProps<{ group: BackendPermissionGroup }>()
  const emit = defineEmits<{ updated: []; deleted: [] }>()

  const editOpen = ref(false)
  const deleting = ref(false)
  const confirm = useConfirm()

  async function performDelete(close?: () => void) {
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
      close?.()
      emit('deleted')
    } finally {
      deleting.value = false
    }
  }

  function confirmDelete() {
    confirm.require({
      group: 'app-shell',
      header: '删除权限组',
      message: `确认删除「${props.group.name}」？此操作不可撤销，组内成员会被同时移除。`,
      acceptLabel: '删除',
      rejectLabel: '取消',
      closeOnEscape: false,
      loading: () => deleting.value,
      onAccept: ({ close }) => void performDelete(close).catch(() => {}),
    })
  }
</script>

<template>
  <CardPanel title="基本信息" :icon="Shield">
    <template #actions>
      <div class="flex items-center gap-2">
        <Button
          label="编辑"
          variant="text"
          size="small"
          severity="secondary"
          :disabled="group.is_system"
          @click="editOpen = true"
        >
          <template #icon>
            <Pencil :size="14" />
          </template>
        </Button>
        <Button
          label="删除"
          variant="text"
          size="small"
          severity="danger"
          :disabled="group.is_system"
          @click="confirmDelete"
        >
          <template #icon>
            <Trash2 :size="14" />
          </template>
        </Button>
      </div>
    </template>
    <dl class="grid grid-cols-1 gap-y-3 text-sm sm:grid-cols-[6rem_1fr]">
      <dt class="text-muted-color">名称</dt>
      <dd class="flex items-center gap-2 font-medium">
        {{ group.name }}
        <Lock
          v-if="group.is_system"
          v-tooltip.top="'系统权限组，不可编辑'"
          :size="14"
          class="text-muted-color"
        />
      </dd>
      <dt class="text-muted-color">描述</dt>
      <dd>{{ group.description || '—' }}</dd>
      <dt class="text-muted-color">权限数</dt>
      <dd>{{ group.permissions.length }} 项</dd>
      <dt class="text-muted-color">创建</dt>
      <dd>
        {{ timeFormat(group.created_at) }}
        <template v-if="group.created_by">
          ·
          <UserName :user="group.created_by" class="inline-flex" />
        </template>
      </dd>
      <dt class="text-muted-color">最近更新</dt>
      <dd>{{ timeFormat(group.updated_at) }}</dd>
    </dl>
  </CardPanel>

  <CreatorGovernanceGroupsEditDialog
    v-model:visible="editOpen"
    :group="group"
    @updated="emit('updated')"
  />
</template>
