<script setup lang="ts">
  import { Button, Inline, Stack, Text, Textarea } from '@hina-ui/vue'
  import { Check, MessageSquare, X } from '@lucide/vue'
  import type { CheckEntityChoice, CheckOverride } from '~/features/creator/check'

  const props = defineProps<{
    changeRequestId: number
    batchId?: string | null
    batchPendingCount?: number
    overrides?: CheckOverride[]
    entityChoices?: CheckEntityChoice[]
  }>()
  const emit = defineEmits<{ reviewed: [] }>()

  const { confirm } = useHikariConfirm()
  const body = ref('')
  const submitting = ref(false)
  const chosen = computed(() => (props.overrides?.length ?? 0) + (props.entityChoices?.length ?? 0))
  const choices = computed(() =>
    chosen.value > 0 ? { overrides: props.overrides, entity_choices: props.entityChoices } : {},
  )

  async function submitReview(decision: 'APPROVE' | 'REJECT' | 'COMMENT') {
    if (submitting.value) return
    submitting.value = true
    try {
      if (decision !== 'COMMENT' && props.batchId) {
        await hikariRequest('/api/v3/change-requests/batches/{batch_id}/reviews', {
          method: 'POST',
          path: { batch_id: props.batchId },
          body: {
            decision,
            body: body.value.trim() || undefined,
            ...(decision === 'APPROVE' ? choices.value : {}),
          },
        })
      } else {
        await hikariRequest('/api/v3/change-requests/{id}/reviews', {
          method: 'POST',
          path: { id: props.changeRequestId },
          body: {
            decision,
            body: body.value.trim() || undefined,
            ...(decision === 'APPROVE' ? choices.value : {}),
          },
        })
      }
      body.value = ''
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
            title: chosen.value > 0 ? '按所选通过' : '通过并合并',
            description: `确认通过此变更请求？合并后修改将立即生效。${batchNote}`,
            confirmText: '确认合并',
          }
        : {
            title: '驳回变更请求',
            description: `确认驳回此变更请求？驳回后该请求将关闭，作者需重新发起新的变更请求。${batchNote}`,
            confirmText: '确认驳回',
          }
    confirm({
      ...meta,
      cancelText: '取消',
      onConfirm: () => submitReview(decision),
    })
  }
</script>

<template>
  <Stack gap="sm">
    <Textarea
      v-model="body"
      :rows="3"
      placeholder="审核意见（可选，驳回时建议填写理由）"
      class="w-full"
    />
    <Inline gap="sm" justify="end" align="center">
      <Text v-if="chosen > 0" as="span" size="sm" tone="muted" class="mr-auto">
        将采用核对结果中的 {{ chosen }} 个值。
      </Text>
      <Button
        tone="neutral"
        :disabled="submitting || !body.trim()"
        @click="submitReview('COMMENT')"
      >
        <template #icon><MessageSquare /></template>
        评论
      </Button>
      <Button tone="danger" :disabled="submitting" @click="confirmReview('REJECT')">
        <template #icon><X /></template>
        驳回
      </Button>
      <Button :disabled="submitting" @click="confirmReview('APPROVE')">
        <template #icon><Check /></template>
        {{ chosen > 0 ? '按所选通过' : '通过并合并' }}
      </Button>
    </Inline>
  </Stack>
</template>
