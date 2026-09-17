<script setup lang="ts">
  import { Select, type DataTableColumn } from '@hina-ui/vue'
  import { timeFormat } from '#imports'
  import { GitPullRequest } from '@lucide/vue'
  import type { BackendChangeRequestList } from '~/features/creator/contribution'

  defineProps<{ list?: BackendChangeRequestList; loading: boolean }>()

  type Row = BackendChangeRequestList['items'][number]

  const page = defineModel<number>('page', { required: true })
  const status = defineModel<string | undefined>('status')

  const STATUS_OPTIONS = [
    { label: '待审核', value: 'PENDING' },
    { label: '已合并', value: 'MERGED' },
    { label: '已驳回', value: 'REJECTED' },
    { label: '已关闭', value: 'CLOSED' },
  ]

  const statusValue = computed({
    get: () => status.value ?? null,
    set: (value: string | number | null) => {
      status.value = value == null ? undefined : String(value)
      page.value = 1
    },
  })

  const columns: DataTableColumn<Row>[] = [
    { key: 'id', label: '#', field: 'id', width: 56 },
    { key: 'resource', label: '条目', minWidth: 224 },
    { key: 'summary', label: '摘要', field: 'summary', truncate: true },
    { key: 'status', label: '状态', width: 96 },
    {
      key: 'created_at',
      label: '提交时间',
      field: 'created_at',
      width: 160,
      format: value => timeFormat(value as string),
      cellClass: 'text-muted',
    },
  ]

  function openDetail(row: Row) {
    void navigateTo(`/create/contributions/${row.id}`)
  }
</script>

<template>
  <CreatorDataTable
    v-model:page="page"
    title="变更请求"
    :icon="GitPullRequest"
    :list="list"
    :columns="columns"
    :loading="loading"
    empty-text="还没有变更请求"
    @row-click="openDetail"
  >
    <template #filter>
      <Select
        v-model="statusValue"
        :options="STATUS_OPTIONS"
        placeholder="全部状态"
        clearable
        aria-label="状态"
        class="w-40"
      />
    </template>

    <template #cell-resource="{ row }">
      <CreatorResourceHead
        :id="row.resource_id"
        size="sm"
        :type="row.resource_type"
        :resource="row.resource"
        class="py-2"
      />
    </template>
    <template #cell-status="{ row }">
      <CreatorStatusBadge :status="row.status" />
    </template>
  </CreatorDataTable>
</template>
