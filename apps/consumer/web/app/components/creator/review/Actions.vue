<script setup lang="ts">
  import { Check, MessageSquare, X } from '@lucide/vue'

  const props = defineProps<{
    changeRequestId: number
    batchId?: string | null
    batchPendingCount?: number
  }>()
  const emit = defineEmits<{ reviewed: [] }>()

  const confirm = useConfirm()
  const body = ref('')
  const submitting = ref(false)

  async function submitReview(decision: 'APPROVE' | 'REJECT' | 'COMMENT', close?: () => void) {
    if (submitting.value) return
    submitting.value = true
    try {
      if (decision !== 'COMMENT' && props.batchId) {
        await hikariRequest('/api/v3/change-requests/batches/{batch_id}/reviews', {
          method: 'POST',
          path: { batch_id: props.batchId },
          body: { decision, body: body.value.trim() || undefined },
        })
      } else {
        await hikariRequest('/api/v3/change-requests/{id}/reviews', {
          method: 'POST',
          path: { id: props.changeRequestId },
          body: { decision, body: body.value.trim() || undefined },
        })
      }
      body.value = ''
      close?.()
      emit('reviewed')
    } catch (error) {
      emit('reviewed')
      throw error
    } finally {
      submitting.value = false
    }
  }

  function confirmReview(decision: 'APPROVE' | 'REJECT') {
    const batchNote =
      props.batchPendingCount && props.batchPendingCount > 1
        ? `本次提交捆绑 ${props.batchPendingCount} 条变更请求，裁决将应用于整批。`
        : ''
    const meta =
      decision === 'APPROVE'
        ? {
            header: '通过并合并',
            message: `确认通过此变更请求？合并后修改将立即生效。${batchNote}`,
            acceptLabel: '确认合并',
          }
        : {
            header: '驳回变更请求',
            message: `确认驳回此变更请求？驳回后该请求将关闭,作者需重新发起新的变更请求。${batchNote}`,
            acceptLabel: '确认驳回',
          }
    confirm.require({
      group: 'app-shell',
      ...meta,
      rejectLabel: '取消',
      closeOnEscape: false,
      loading: () => submitting.value,
      onAccept: ({ close }) => void submitReview(decision, close).catch(() => {}),
    })
  }
</script>

<template>
  <div class="flex flex-col gap-3">
    <Textarea v-model="body" rows="3" placeholder="审核意见(可选,驳回时建议填写理由)" fluid />
    <div class="flex flex-wrap justify-end gap-2">
      <Button
        label="评论"
        severity="secondary"
        :disabled="submitting || !body.trim()"
        @click="submitReview('COMMENT')"
      >
        <template #icon>
          <MessageSquare :size="15" />
        </template>
      </Button>
      <Button
        label="驳回"
        severity="danger"
        :disabled="submitting"
        @click="confirmReview('REJECT')"
      >
        <template #icon>
          <X :size="15" />
        </template>
      </Button>
      <Button label="通过并合并" :disabled="submitting" @click="confirmReview('APPROVE')">
        <template #icon>
          <Check :size="15" />
        </template>
      </Button>
    </div>
  </div>
</template>
