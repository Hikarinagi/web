<script setup lang="ts">
  import { Alert, Button, Card, Heading, Inline, Link, Panel, Stack, Text } from '@hina-ui/vue'
  import { NuxtLink } from '#components'
  import { timeFormat } from '#imports'
  import { WIKI_PERMISSIONS } from '@hikarinagi/shared'
  import { ClipboardCheck, FileDiff, History, Pencil, X } from '@lucide/vue'
  import type {
    BackendChangeRequestDetail,
    BackendChangeRequestSummary,
  } from '~/features/creator/contribution'
  import { onSite } from '~/features/creator/check'
  import { PUBLIC_PATH } from '~/features/creator/duplicates'
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
  const checkMode = computed(() => {
    if (canReview.value) return 'review'
    const reviewer = !isMine.value && canAny(WIKI_PERMISSIONS.REVIEW)
    return props.changeRequest.status === 'MERGED' && reviewer ? 'correct' : 'view'
  })
  const choices = useCheckChoices(() => props.changeRequest)
  const possible = computed(() => (canClose.value ? onSite(props.changeRequest.check) : null))
  const possibleSlug = computed(() => RESOURCE_SLUG[props.changeRequest.resource_type])
  const continueLink = computed(() => {
    const cr = props.changeRequest
    if (cr.status !== 'PENDING' || !isMine.value || cr.resource_id == null) return null
    const slug = RESOURCE_SLUG[cr.resource_type]
    return slug ? `/create/edit/${slug}/${cr.resource_id}` : null
  })

  const mergedInto = computed(() => {
    const event = props.changeRequest.events.find(item => item.type === 'MERGED_INTO')
    const target = (event?.payload as unknown as { target_id?: unknown } | null)?.target_id
    return typeof target === 'number' ? target : null
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
    <Alert :open="!!possible" tone="warning" title="可能已收录">
      <Text as="span">
        核对发现「{{ changeRequest.resource?.title }}」可能已收录为
        <Link
          :as="NuxtLink"
          :to="`${PUBLIC_PATH[changeRequest.resource_type] ?? '/'}${possible?.id}`"
          target="_blank"
        >
          #{{ possible?.id }} {{ possible?.title }}</Link
        >。如果这是同一本书，请撤回此请求并改为编辑 #{{ possible?.id }}。
      </Text>
      <template #actions>
        <Button
          v-if="possibleSlug"
          :as="NuxtLink"
          :to="`/create/edit/${possibleSlug}/${possible?.id}`"
          size="sm"
        >
          编辑 #{{ possible?.id }}
        </Button>
        <Button
          variant="outline"
          tone="neutral"
          size="sm"
          :disabled="closing"
          @click="confirmClose"
        >
          撤回请求
        </Button>
      </template>
    </Alert>

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
          <Text v-if="mergedInto" as="span" size="sm" tone="muted">已并入 #{{ mergedInto }}</Text>
          <Text v-else-if="changeRequest.merged_revision" as="span" size="sm" tone="muted">
            已合并为修订版本 v{{ changeRequest.merged_revision.version }}
          </Text>
        </Inline>
      </Stack>
    </Card>

    <CreatorReviewCheckPanel
      v-model:fields="choices.fields.value"
      v-model:entities="choices.entities.value"
      :change-request="changeRequest"
      :mode="checkMode"
      :overrides="choices.overrides.value"
      :entity-choices="choices.entityChoices.value"
      @changed="emit('reviewed')"
    />

    <CreatorReviewDuplicatePanel
      v-if="changeRequest.status === 'PENDING'"
      :change-request="changeRequest"
      :can-review="canReview"
      :entity-choices="choices.entityChoices.value"
      @reviewed="emit('reviewed')"
    />

    <Panel title="变更内容" :count="payload.length">
      <template #icon><FileDiff /></template>
      <CreatorChangesetView :payload="payload" :resource-type="changeRequest.resource_type" />
    </Panel>

    <CreatorContributionBatchPanel v-if="batchMembers?.length" :batch-members="batchMembers" />

    <Panel v-if="canReview" title="审核">
      <template #icon><ClipboardCheck /></template>
      <CreatorReviewActions
        :change-request-id="changeRequest.id"
        :batch-id="changeRequest.batch_id"
        :batch-pending-count="pendingBatchCount"
        :overrides="choices.overrides.value"
        :entity-choices="choices.entityChoices.value"
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
