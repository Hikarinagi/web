<script setup lang="ts">
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

  const STATUS_OPTIONS = [
    { label: '全部状态', value: undefined },
    { label: '待处理', value: 'PENDING' },
    { label: '已通过', value: 'APPROVED' },
    { label: '已驳回', value: 'REJECTED' },
  ]

  const drawerOpen = ref(false)
  const active = shallowRef<BackendReviewGroupApplicationSummary | null>(null)

  function openDetail(row: { id: number }) {
    active.value = row as BackendReviewGroupApplicationSummary
    drawerOpen.value = true
  }

  function onStatusChange() {
    page.value = 1
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
      <CreatorEmpty text="还没有申请" />
    </template>
    <Column header="#" class="w-14">
      <template #body="{ data: row }">{{ row.id }}</template>
    </Column>
    <Column header="申请人" class="min-w-32">
      <template #body="{ data: row }"><UserName :user="row.requester" :handle="false" /></template>
    </Column>
    <Column header="申请加入" class="min-w-32">
      <template #body="{ data: row }">{{ row.permission_group.name }}</template>
    </Column>
    <Column header="理由">
      <template #body="{ data: row }">
        <span class="line-clamp-1 text-muted-color">{{ row.reason }}</span>
      </template>
    </Column>
    <Column header="状态" class="w-24">
      <template #body="{ data: row }">
        <CreatorGovernanceApplicationsStatusBadge :status="row.status" />
      </template>
    </Column>
    <Column header="提交时间" class="w-40">
      <template #body="{ data: row }">
        <span class="text-muted-color">{{ timeFormat(row.created_at) }}</span>
      </template>
    </Column>
  </CreatorDataTable>

  <Drawer
    v-model:visible="drawerOpen"
    position="right"
    header="申请详情"
    :pt="{ root: { class: 'w-[min(92vw,32rem)]!' } }"
  >
    <CreatorGovernanceApplicationsDetail
      v-if="activeApplication"
      :application="activeApplication"
      @changed="onChanged"
    />
  </Drawer>
</template>
