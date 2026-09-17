<script setup lang="ts">
  import {
    Button,
    Callout,
    DescriptionDetails,
    DescriptionList,
    DescriptionTerm,
    Inline,
    Link,
    Stack,
    Text,
  } from '@hina-ui/vue'
  import { timeFormat } from '#imports'
  import { Check, ExternalLink, X } from '@lucide/vue'
  import type { BackendReviewGroupApplication } from '~/features/creator/membership'

  const props = defineProps<{
    application: BackendReviewGroupApplication
    readonly?: boolean
  }>()
  const emit = defineEmits<{ changed: [] }>()

  const { confirm } = useHikariConfirm()
  const approving = ref(false)
  const rejectOpen = ref(false)

  async function performApprove() {
    if (approving.value) return
    approving.value = true
    try {
      await hikariRequest('/api/v3/review-group-applications/{id}/approve', {
        method: 'POST',
        path: { id: props.application.id },
      })
      emit('changed')
    } finally {
      approving.value = false
    }
  }

  function confirmApprove() {
    confirm({
      title: '通过申请',
      description: `确认通过 ${displayName(props.application.requester)} 加入「${props.application.permission_group.name}」？通过后用户立即成为该组成员。`,
      confirmText: '通过',
      cancelText: '取消',
      onConfirm: () => performApprove(),
    })
  }
</script>

<template>
  <Stack gap="md">
    <Inline gap="sm" align="center">
      <Avatar
        :user="application.requester"
        card
        class="size-12! shrink-0 bg-subtle font-semibold"
      />
      <Stack gap="none" class="min-w-0">
        <UserName :user="application.requester" class="text-base font-semibold" />
        <Text size="sm" tone="muted">
          申请加入 ·
          <Text as="span" size="sm" class="font-medium text-fg">
            {{ application.permission_group.name }}
          </Text>
        </Text>
      </Stack>
      <CreatorGovernanceApplicationsStatusBadge :status="application.status" class="ms-auto" />
    </Inline>

    <Stack gap="sm">
      <Text size="sm" weight="medium">申请理由</Text>
      <Callout :icon="false">
        <Text size="sm">{{ application.reason }}</Text>
      </Callout>
    </Stack>

    <Stack v-if="application.homepage" gap="sm">
      <Text size="sm" weight="medium">个人主页</Text>
      <Link
        :href="application.homepage"
        target="_blank"
        rel="noopener noreferrer"
        class="w-fit text-sm"
      >
        <Inline gap="xs" align="center" :wrap="false">
          <ExternalLink class="size-3.5 shrink-0" />
          {{ application.homepage }}
        </Inline>
      </Link>
    </Stack>

    <Stack v-if="application.images.length" gap="sm">
      <Text size="sm" weight="medium">附图（{{ application.images.length }}）</Text>
      <MediaLibrarySelection
        :model-value="application.images.map(image => image.media)"
        disabled
        class="sm:grid-cols-4"
      />
    </Stack>

    <Stack v-if="application.status === 'REJECTED' && application.rejection_reason" gap="sm">
      <Text size="sm" weight="medium">驳回理由</Text>
      <Callout tone="danger" :icon="false">
        <Text size="sm">{{ application.rejection_reason }}</Text>
      </Callout>
    </Stack>

    <DescriptionList>
      <DescriptionTerm>申请时间</DescriptionTerm>
      <DescriptionDetails>{{ timeFormat(application.created_at) }}</DescriptionDetails>
      <DescriptionTerm>最近更新</DescriptionTerm>
      <DescriptionDetails>{{ timeFormat(application.updated_at) }}</DescriptionDetails>
    </DescriptionList>

    <Inline
      v-if="!readonly && application.status === 'PENDING'"
      gap="sm"
      justify="end"
      class="border-t border-line pt-4"
    >
      <Button tone="danger" :disabled="approving" @click="rejectOpen = true">
        <template #icon><X /></template>
        驳回
      </Button>
      <Button :disabled="approving" @click="confirmApprove">
        <template #icon><Check /></template>
        通过
      </Button>
    </Inline>
  </Stack>

  <CreatorGovernanceApplicationsRejectDialog
    v-model:visible="rejectOpen"
    :application-id="application.id"
    @rejected="emit('changed')"
  />
</template>
