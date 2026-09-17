<script setup lang="ts">
  import { Button, Card, Heading, Inline, Panel, Stack, Text } from '@hina-ui/vue'
  import { NuxtLink } from '#components'
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
  const { confirm } = useHikariConfirm()
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

  async function performClose() {
    if (closing.value) return
    closing.value = true
    try {
      await hikariRequest('/api/v3/change-requests/{id}/close', {
        method: 'POST',
        path: { id: props.changeRequest.id },
      })
      emit('closed')
    } finally {
      closing.value = false
    }
  }

  function confirmClose() {
    confirm({
      title: '关闭变更请求',
      description:
        '确定要关闭这个变更请求吗？关闭后将不再进入审核队列，你可以为该条目重新发起新的变更请求。',
      confirmText: '关闭',
      cancelText: '取消',
      onConfirm: () => performClose(),
    })
  }
</script>

<template>
  <Stack gap="md">
    <Card>
      <Stack gap="sm">
        <Inline gap="sm" align="start" justify="between" :wrap="false">
          <CreatorResourceHead
            :id="changeRequest.resource_id"
            :type="changeRequest.resource_type"
            :resource="changeRequest.resource"
          />
          <Inline gap="sm" align="center" :wrap="false" class="shrink-0">
            <Button
              v-if="continueLink"
              :as="NuxtLink"
              :to="continueLink"
              variant="ghost"
              tone="neutral"
              size="sm"
            >
              <template #icon><Pencil /></template>
              继续编辑
            </Button>
            <Button
              v-if="canClose"
              variant="ghost"
              tone="danger"
              size="sm"
              :disabled="closing"
              @click="confirmClose"
            >
              <template #icon><X /></template>
              关闭
            </Button>
            <CreatorStatusBadge :status="changeRequest.status" />
          </Inline>
        </Inline>

        <Heading :level="2" size="lg">{{ changeRequest.summary }}</Heading>

        <Inline gap="md" align="center" class="text-sm text-muted">
          <Inline gap="xs" align="center" :wrap="false">
            <Avatar :user="changeRequest.author" card class="size-5!" />
            <UserName :user="changeRequest.author" />
          </Inline>
          <Text as="span" size="sm" tone="muted">
            提交于 {{ timeFormat(changeRequest.created_at) }}
          </Text>
          <Text v-if="changeRequest.merged_revision" as="span" size="sm" tone="muted">
            已合并为修订版本 v{{ changeRequest.merged_revision.version }}
          </Text>
        </Inline>
      </Stack>
    </Card>

    <Panel title="变更内容" :count="payload.length">
      <template #icon><FileDiff /></template>
      <CreatorChangesetView :payload="payload" :resource-type="changeRequest.resource_type" />
    </Panel>

    <Panel
      v-if="batchMembers?.length"
      title="同批提交"
      :count="batchMembers.length"
      description="同一次提交捆绑的变更请求，审核裁决会应用于整批。"
    >
      <template #icon><Layers /></template>
      <Stack gap="none">
        <NuxtLink
          v-for="member in batchMembers"
          :key="member.id"
          :to="`/create/contributions/${member.id}`"
          class="hn-state-layer hn-interactive rounded-lg px-2 py-2"
        >
          <Inline gap="sm" align="center" justify="between" :wrap="false">
            <CreatorResourceHead
              :id="member.resource_id"
              size="sm"
              :type="member.resource_type"
              :resource="member.resource"
            />
            <Inline gap="sm" align="center" :wrap="false" class="shrink-0">
              <Text as="span" size="sm" tone="muted" truncate class="max-w-72">
                {{ member.summary }}
              </Text>
              <CreatorStatusBadge :status="member.status" />
            </Inline>
          </Inline>
        </NuxtLink>
      </Stack>
    </Panel>

    <Panel v-if="canReview" title="审核">
      <template #icon><ClipboardCheck /></template>
      <CreatorReviewActions
        :change-request-id="changeRequest.id"
        :batch-id="changeRequest.batch_id"
        :batch-pending-count="pendingBatchCount"
        @reviewed="emit('reviewed')"
      />
    </Panel>

    <Panel title="时间线">
      <template #icon><History /></template>
      <CreatorContributionTimeline
        v-if="changeRequest.events.length"
        :events="changeRequest.events"
        :resource-type="changeRequest.resource_type"
      />
      <CreatorEmpty v-else text="暂无记录" />
    </Panel>
  </Stack>
</template>
