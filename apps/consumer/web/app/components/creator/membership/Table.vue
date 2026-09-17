<script setup lang="ts">
  import { Button, Drawer, type DataTableColumn } from '@hina-ui/vue'
  import { timeFormat } from '#imports'
  import { BadgeCheck, Plus } from '@lucide/vue'
  import type {
    BackendMyReviewGroupApplication,
    BackendMyReviewGroupApplicationList,
    BackendReviewGroupCandidate,
  } from '~/features/creator/membership'

  defineProps<{
    list?: BackendMyReviewGroupApplicationList
    candidates: readonly BackendReviewGroupCandidate[]
    loading: boolean
  }>()
  const page = defineModel<number>('page', { required: true })
  const emit = defineEmits<{ changed: [] }>()

  type Row = BackendMyReviewGroupApplication

  const columns: DataTableColumn<Row>[] = [
    { key: 'id', label: '#', field: 'id', width: 56 },
    {
      key: 'permission_group',
      label: '目标审核组',
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
  const applyOpen = ref(false)

  function openDetail(row: Row) {
    active.value = row
    drawerOpen.value = true
  }
</script>

<template>
  <CreatorDataTable
    v-model:page="page"
    title="我的申请"
    :icon="BadgeCheck"
    :list="list"
    :columns="columns"
    :loading="loading"
    empty-text="还没有发起过审核组申请"
    @row-click="openDetail"
  >
    <template #actions>
      <Button size="sm" @click="applyOpen = true">
        <template #icon><Plus /></template>
        发起申请
      </Button>
    </template>

    <template #cell-status="{ row }">
      <CreatorGovernanceApplicationsStatusBadge :status="row.status" />
    </template>
  </CreatorDataTable>

  <Drawer v-model:open="drawerOpen" side="end" size="lg" title="申请详情">
    <template #content>
      <CreatorGovernanceApplicationsDetail v-if="active" :application="active" readonly />
    </template>
  </Drawer>

  <CreatorMembershipApplyDialog
    v-model:visible="applyOpen"
    :candidates="candidates"
    @submitted="emit('changed')"
  />
</template>
