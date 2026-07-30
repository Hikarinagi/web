<script setup lang="ts">
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

  const drawerOpen = ref(false)
  const active = shallowRef<BackendMyReviewGroupApplication | null>(null)
  const applyOpen = ref(false)

  function openDetail(row: { id: number }) {
    active.value = row as BackendMyReviewGroupApplication
    drawerOpen.value = true
  }
</script>

<template>
  <CreatorDataTable
    v-model:page="page"
    title="我的申请"
    :icon="BadgeCheck"
    :list="list"
    :loading="loading"
    @row-click="openDetail"
  >
    <template #actions>
      <Button label="发起申请" size="small" @click="applyOpen = true">
        <template #icon>
          <Plus :size="15" />
        </template>
      </Button>
    </template>
    <template #empty>
      <CreatorEmpty text="还没有发起过审核组申请" />
    </template>
    <Column header="#" class="w-14">
      <template #body="{ data: row }">{{ row.id }}</template>
    </Column>
    <Column header="目标审核组" class="min-w-32">
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
    <CreatorGovernanceApplicationsDetail v-if="active" :application="active" readonly />
  </Drawer>

  <CreatorMembershipApplyDialog
    v-model:visible="applyOpen"
    :candidates="candidates"
    @submitted="emit('changed')"
  />
</template>
