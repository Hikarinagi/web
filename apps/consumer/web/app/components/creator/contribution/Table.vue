<script setup lang="ts">
  import { timeFormat } from '#imports'
  import { GitPullRequest } from '@lucide/vue'
  import type { BackendChangeRequestList } from '~/features/creator/contribution'

  defineProps<{ list?: BackendChangeRequestList; loading: boolean }>()

  const page = defineModel<number>('page', { required: true })
  const status = defineModel<string | undefined>('status')

  const STATUS_OPTIONS = [
    { label: '全部状态', value: undefined },
    { label: '待审核', value: 'PENDING' },
    { label: '已合并', value: 'MERGED' },
    { label: '已驳回', value: 'REJECTED' },
    { label: '已关闭', value: 'CLOSED' },
  ]

  function onStatusChange() {
    page.value = 1
  }

  function openDetail(row: { id: number }) {
    void navigateTo(`/create/contributions/${row.id}`)
  }
</script>

<template>
  <CreatorDataTable
    v-model:page="page"
    title="变更请求"
    :icon="GitPullRequest"
    :list="list"
    :loading="loading"
    @row-click="openDetail"
  >
    <template #filter>
      <Select
        v-model="status"
        :options="STATUS_OPTIONS"
        option-label="label"
        option-value="value"
        placeholder="全部状态"
        class="w-40"
        @change="onStatusChange"
      />
    </template>
    <template #empty>
      <CreatorEmpty text="还没有变更请求" />
    </template>
    <Column header="#" class="w-14">
      <template #body="{ data: row }">{{ row.id }}</template>
    </Column>
    <Column header="条目" class="min-w-56">
      <template #body="{ data: row }">
        <CreatorResourceHead
          :id="row.resource_id"
          size="sm"
          :type="row.resource_type"
          :resource="row.resource"
        />
      </template>
    </Column>
    <Column header="摘要">
      <template #body="{ data: row }">
        <span class="line-clamp-1">{{ row.summary }}</span>
      </template>
    </Column>
    <Column header="状态" class="w-24">
      <template #body="{ data: row }">
        <CreatorStatusBadge :status="row.status" />
      </template>
    </Column>
    <Column header="提交时间" class="w-40">
      <template #body="{ data: row }">
        <span class="text-muted-color">{{ timeFormat(row.created_at) }}</span>
      </template>
    </Column>
  </CreatorDataTable>
</template>
