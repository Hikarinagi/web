<script setup lang="ts">
  import { timeFormat } from '#imports'
  import { WIKI_PERMISSIONS } from '@hikarinagi/shared'
  import { ClipboardCheck, FileDiff, History, Layers, Pencil, X } from '@lucide/vue'
  import type {
    BackendChangeRequestDetail,
    BackendChangeRequestSummary,
  } from '~/features/creator/contribution'
  import { RESOURCE_SLUG } from '~/features/creator/labels'

  const props = defineProps<{
    changeRequest: BackendChangeRequestDetail
    batchMembers?: BackendChangeRequestSummary[]
  }>()
  const emit = defineEmits<{ reviewed: []; closed: [] }>()

  const payload = computed(() => props.changeRequest.payload ?? [])
  const pendingBatchCount = computed(
    () =>
      (props.batchMembers ?? []).filter(member => member.status === 'PENDING').length +
      (props.changeRequest.status === 'PENDING' ? 1 : 0),
  )

  const auth = useAuthStore()
  const confirm = useConfirm()
  const { canAny } = useCreatorPermissions()
  const isMine = computed(() => props.changeRequest.author.id === auth.user?.id)
  const canReview = computed(
    () =>
      props.changeRequest.status === 'PENDING' && !isMine.value && canAny(WIKI_PERMISSIONS.REVIEW),
  )
  const canClose = computed(() => props.changeRequest.status === 'PENDING' && isMine.value)
  const continueLink = computed(() => {
    const cr = props.changeRequest
    if (cr.status !== 'PENDING' || !isMine.value || cr.resource_id == null) return null
    const slug = RESOURCE_SLUG[cr.resource_type]
    return slug ? `/create/edit/${slug}/${cr.resource_id}` : null
  })

  const closing = ref(false)

  async function performClose(close?: () => void) {
    if (closing.value) return
    closing.value = true
    try {
      await hikariRequest('/api/v3/change-requests/{id}/close', {
        method: 'POST',
        path: { id: props.changeRequest.id },
      })
      close?.()
      emit('closed')
    } finally {
      closing.value = false
    }
  }

  function confirmClose() {
    confirm.require({
      group: 'app-shell',
      header: '关闭变更请求',
      message:
        '确定要关闭这个变更请求吗？关闭后将不再进入审核队列，你可以为该条目重新发起新的变更请求。',
      acceptLabel: '关闭',
      rejectLabel: '取消',
      closeOnEscape: false,
      loading: () => closing.value,
      onAccept: ({ close }) => void performClose(close).catch(() => {}),
    })
  }
</script>

<template>
  <div class="flex flex-col gap-5">
    <Card>
      <template #content>
        <div class="flex flex-col gap-3">
          <div class="flex items-start justify-between gap-3">
            <CreatorResourceHead
              :id="changeRequest.resource_id"
              :type="changeRequest.resource_type"
              :resource="changeRequest.resource"
            />
            <div class="flex shrink-0 items-center gap-2">
              <Button
                v-if="continueLink"
                as="router-link"
                :to="continueLink"
                variant="text"
                size="small"
                label="继续编辑"
              >
                <template #icon>
                  <Pencil :size="15" />
                </template>
              </Button>
              <Button
                v-if="canClose"
                variant="text"
                size="small"
                severity="danger"
                label="关闭"
                :disabled="closing"
                @click="confirmClose"
              >
                <template #icon>
                  <X :size="15" />
                </template>
              </Button>
              <CreatorStatusBadge :status="changeRequest.status" />
            </div>
          </div>
          <h2 class="text-lg font-semibold">{{ changeRequest.summary }}</h2>
          <div class="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-color">
            <span class="flex items-center gap-1.5">
              <Avatar :user="changeRequest.author" card shape="circle" class="size-5!" />
              <UserName :user="changeRequest.author" />
            </span>
            <span>提交于 {{ timeFormat(changeRequest.created_at) }}</span>
            <span v-if="changeRequest.merged_revision">
              已合并为修订版本 v{{ changeRequest.merged_revision.version }}
            </span>
          </div>
        </div>
      </template>
    </Card>

    <CardPanel title="变更内容" :icon="FileDiff" :count="payload.length">
      <CreatorChangesetView :payload="payload" :resource-type="changeRequest.resource_type" />
    </CardPanel>

    <CardPanel
      v-if="batchMembers?.length"
      title="同批提交"
      :icon="Layers"
      :count="batchMembers.length"
      description="同一次提交捆绑的变更请求，审核裁决会应用于整批。"
    >
      <div class="flex flex-col">
        <NuxtLink
          v-for="member in batchMembers"
          :key="member.id"
          :to="`/create/contributions/${member.id}`"
          class="flex items-center justify-between gap-3 rounded-lg px-2 py-2 hover:bg-emphasis"
        >
          <CreatorResourceHead
            :id="member.resource_id"
            size="sm"
            :type="member.resource_type"
            :resource="member.resource"
          />
          <span class="flex shrink-0 items-center gap-3">
            <span class="line-clamp-1 max-w-72 text-sm text-muted-color">
              {{ member.summary }}
            </span>
            <CreatorStatusBadge :status="member.status" />
          </span>
        </NuxtLink>
      </div>
    </CardPanel>

    <CardPanel v-if="canReview" title="审核" :icon="ClipboardCheck">
      <CreatorReviewActions
        :change-request-id="changeRequest.id"
        :batch-id="changeRequest.batch_id"
        :batch-pending-count="pendingBatchCount"
        @reviewed="emit('reviewed')"
      />
    </CardPanel>

    <CardPanel title="时间线" :icon="History">
      <CreatorContributionTimeline
        v-if="changeRequest.events.length"
        :events="changeRequest.events"
        :resource-type="changeRequest.resource_type"
      />
      <CreatorEmpty v-else text="暂无记录" />
    </CardPanel>
  </div>
</template>
