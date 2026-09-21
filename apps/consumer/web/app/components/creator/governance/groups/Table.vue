<script setup lang="ts">
  import { Button, Inline, Tag, Text, type DataTableColumn } from '@hina-ui/vue'
  import { timeFormat } from '#imports'
  import { Plus, Shield, Lock } from '@lucide/vue'
  import type { BackendPermissionGroupList } from '~/features/creator/governance'

  defineProps<{ list?: BackendPermissionGroupList; loading: boolean }>()
  const page = defineModel<number>('page', { required: true })
  const emit = defineEmits<{ created: [] }>()

  type Row = BackendPermissionGroupList['items'][number]

  const columns: DataTableColumn<Row>[] = [
    { key: 'id', label: '#', field: 'id', width: 56 },
    { key: 'name', label: '名称', minWidth: 160 },
    {
      key: 'description',
      label: '描述',
      accessor: row => row.description || '—',
      truncate: true,
      cellClass: 'text-muted',
    },
    { key: 'permissions', label: '权限', width: 96 },
    { key: 'created_by', label: '创建人', width: 128 },
    {
      key: 'created_at',
      label: '创建时间',
      field: 'created_at',
      width: 160,
      format: value => timeFormat(value as string),
      cellClass: 'text-muted',
    },
  ]

  const dialogOpen = ref(false)

  function openDetail(row: Row) {
    void navigateTo(`/create/governance/groups/${row.id}`)
  }
</script>

<template>
  <CreatorDataTable
    v-model:page="page"
    title="权限组"
    :icon="Shield"
    :list="list"
    :columns="columns"
    :loading="loading"
    empty-text="还没有权限组"
    @row-click="openDetail"
  >
    <template #actions>
      <Button size="sm" @click="dialogOpen = true">
        <template #icon><Plus /></template>
        新建
      </Button>
    </template>

    <template #cell-name="{ row }">
      <Inline gap="xs" align="center" :wrap="false">
        <Text as="span" size="sm" weight="medium">{{ row.name }}</Text>
        <Lock
          v-if="row.is_system"
          v-tooltip="'系统权限组，不可编辑'"
          class="size-3.5 shrink-0 text-muted"
        />
      </Inline>
    </template>
    <template #cell-permissions="{ row }">
      <Tag size="sm" tone="neutral">{{ row.permissions.length }} 项</Tag>
    </template>
    <template #cell-created_by="{ row }">
      <UserName :user="row.created_by" :handle="false" fallback="系统" class="text-muted" />
    </template>
  </CreatorDataTable>

  <CreatorGovernanceGroupsCreateDialog v-model:visible="dialogOpen" @created="emit('created')" />
</template>
