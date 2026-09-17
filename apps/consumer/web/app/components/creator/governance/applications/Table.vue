<script setup lang="ts">
  import { Drawer, Select, type DataTableColumn } from '@hina-ui/vue'
  import { timeFormat } from '#imports'
  import { BadgeCheck } from '@lucide/vue'
  import type {
    BackendReviewGroupApplication,
    BackendReviewGroupApplicationList,
    BackendReviewGroupApplicationSummary,
  } from '~/features/creator/membership'

  const props = defineProps<{
    list?: BackendReviewGroupApplicationList
    loading: boolean
  }>()
  const page = defineModel<number>('page', { required: true })
  const status = defineModel<string | undefined>('status')
  const emit = defineEmits<{ changed: [] }>()

  type Row = BackendReviewGroupApplicationSummary

  const STATUS_OPTIONS = [
    { label: '待处理', value: 'PENDING' },
    { label: '已通过', value: 'APPROVED' },
    { label: '已驳回', value: 'REJECTED' },
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
    { key: 'requester', label: '申请人', minWidth: 128 },
    {
      key: 'permission_group',
      label: '申请加入',
      minWidth: 128,
      accessor: row => row.permission_group.name,
    },
    { key: 'reason', label: '理由', field: 'reason', truncate: true, cellClass: 'text-muted' },
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

  const drawerOpen = ref(false)
  const active = shallowRef<Row | null>(null)

  function openDetail(row: Row) {
    active.value = row
    drawerOpen.value = true
  }

  function onChanged() {
    drawerOpen.value = false
    emit('changed')
  }

  const activeApplication = computed<BackendReviewGroupApplication | null>(() => active.value)
  void props
</script>

<template>
  <CreatorDataTable
    v-model:page="page"
    title="审核组申请"
    :icon="BadgeCheck"
    :list="list"
    :columns="columns"
    :loading="loading"
    empty-text="还没有申请"
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

    <template #cell-requester="{ row }">
      <UserName :user="row.requester" :handle="false" />
    </template>
    <template #cell-status="{ row }">
      <CreatorGovernanceApplicationsStatusBadge :status="row.status" />
    </template>
  </CreatorDataTable>

  <Drawer v-model:open="drawerOpen" side="end" size="lg" title="申请详情">
    <template #content>
      <CreatorGovernanceApplicationsDetail
        v-if="activeApplication"
        :application="activeApplication"
        @changed="onChanged"
      />
    </template>
  </Drawer>
</template>
