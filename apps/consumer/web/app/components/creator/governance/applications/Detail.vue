<script setup lang="ts">
  import { timeFormat } from '#imports'
  import { Check, ExternalLink, X } from '@lucide/vue'
  import type { BackendReviewGroupApplication } from '~/features/creator/membership'

  const props = defineProps<{
    application: BackendReviewGroupApplication
    readonly?: boolean
  }>()
  const emit = defineEmits<{ changed: [] }>()

  const confirm = useConfirm()
  const approving = ref(false)
  const rejectOpen = ref(false)

  async function performApprove(close?: () => void) {
    if (approving.value) return
    approving.value = true
    try {
      await hikariRequest('/api/v3/review-group-applications/{id}/approve', {
        method: 'POST',
        path: { id: props.application.id },
      })
      close?.()
      emit('changed')
    } finally {
      approving.value = false
    }
  }

  function confirmApprove() {
    confirm.require({
      group: 'app-shell',
      header: '通过申请',
      message: `确认通过 ${displayName(props.application.requester)} 加入「${props.application.permission_group.name}」？通过后用户立即成为该组成员。`,
      acceptLabel: '通过',
      rejectLabel: '取消',
      closeOnEscape: false,
      loading: () => approving.value,
      onAccept: ({ close }) => void performApprove(close).catch(() => {}),
    })
  }
</script>

<template>
  <div class="flex flex-col gap-5">
    <div class="flex flex-wrap items-center gap-3">
      <Avatar
        :user="application.requester"
        card
        shape="circle"
        class="size-12! shrink-0 bg-surface-200 font-semibold dark:bg-surface-700"
      />
      <div class="min-w-0">
        <UserName :user="application.requester" class="text-base font-semibold" />
        <p class="text-sm text-muted-color">
          申请加入 ·
          <span class="font-medium text-color">{{ application.permission_group.name }}</span>
        </p>
      </div>
      <div class="ml-auto">
        <CreatorGovernanceApplicationsStatusBadge :status="application.status" />
      </div>
    </div>

    <div class="flex flex-col gap-2">
      <p class="text-sm font-medium">申请理由</p>
      <p class="rounded-md bg-surface-50 px-4 py-3 text-sm leading-6 dark:bg-surface-900">
        {{ application.reason }}
      </p>
    </div>

    <div v-if="application.homepage" class="flex flex-col gap-2">
      <p class="text-sm font-medium">个人主页</p>
      <Button
        as="a"
        :href="application.homepage"
        target="_blank"
        rel="noopener noreferrer"
        variant="link"
        size="small"
        :label="application.homepage"
        class="self-start p-0!"
      >
        <template #icon>
          <ExternalLink :size="13" />
        </template>
      </Button>
    </div>

    <div v-if="application.images.length" class="flex flex-col gap-2">
      <p class="text-sm font-medium">附图({{ application.images.length }})</p>
      <MediaLibrarySelection
        :model-value="application.images.map(image => image.media)"
        disabled
        class="sm:grid-cols-4"
      />
    </div>

    <div
      v-if="application.status === 'REJECTED' && application.rejection_reason"
      class="flex flex-col gap-2"
    >
      <p class="text-sm font-medium">驳回理由</p>
      <p
        class="rounded-md bg-red-50 px-4 py-3 text-sm leading-6 text-red-700 dark:bg-red-900/40 dark:text-red-200"
      >
        {{ application.rejection_reason }}
      </p>
    </div>

    <dl class="grid grid-cols-1 gap-y-2 text-sm sm:grid-cols-[5rem_1fr]">
      <dt class="text-muted-color">申请时间</dt>
      <dd>{{ timeFormat(application.created_at) }}</dd>
      <dt class="text-muted-color">最近更新</dt>
      <dd>{{ timeFormat(application.updated_at) }}</dd>
    </dl>

    <div
      v-if="!readonly && application.status === 'PENDING'"
      class="flex flex-wrap justify-end gap-2 border-t border-surface-200 pt-4 dark:border-surface-800"
    >
      <Button label="驳回" severity="danger" :disabled="approving" @click="rejectOpen = true">
        <template #icon>
          <X :size="15" />
        </template>
      </Button>
      <Button label="通过" :disabled="approving" @click="confirmApprove">
        <template #icon>
          <Check :size="15" />
        </template>
      </Button>
    </div>
  </div>

  <CreatorGovernanceApplicationsRejectDialog
    v-model:visible="rejectOpen"
    :application-id="application.id"
    @rejected="emit('changed')"
  />
</template>
