<script setup lang="ts">
  import Form, { type FormSubmitEvent } from '@primevue/forms/form'
  import type { Changeset } from '~/features/creator/editor/changeset'
  import {
    editorSubmitResolver,
    type EditorSubmitValues,
  } from '~/features/creator/schemas/editor-submit.schema'

  const props = defineProps<{
    changeset: Changeset
    resourceType: string
    needsReview: boolean
    submitting: boolean
    isContinue?: boolean
  }>()
  const visible = defineModel<boolean>('visible', { required: true })
  const emit = defineEmits<{ confirm: [summary: string] }>()

  const payload = ref<Record<string, unknown>[]>([])
  watchEffect(() => {
    if (visible.value) payload.value = props.changeset as unknown as Record<string, unknown>[]
  })

  function onSubmit(event: FormSubmitEvent) {
    if (!event.valid) return
    emit('confirm', (event.values as EditorSubmitValues).summary)
  }
</script>

<template>
  <Dialog
    v-model:visible="visible"
    modal
    header="确认提交变更"
    :dismissable-mask="!submitting"
    :style="{ width: '92vw', maxWidth: '40rem' }"
  >
    <div class="flex flex-col gap-5">
      <div class="flex flex-col gap-2">
        <h3 class="text-sm font-semibold text-surface-700 dark:text-surface-200">
          变更内容（{{ payload.length }}）
        </h3>
        <CreatorChangesetView :payload="payload" :resource-type="resourceType" />
      </div>

      <Message v-if="isContinue" severity="warn" variant="simple" size="small">
        确认后将更新这个进行中的变更请求
      </Message>
      <Message v-else-if="needsReview" severity="warn" variant="simple" size="small">
        提交后将进入审核队列，由审核者合并后生效
      </Message>
      <Message v-else severity="success" variant="simple" size="small">
        确认后修改将立即生效
      </Message>

      <Form :resolver="editorSubmitResolver" class="flex flex-col gap-3" @submit="onSubmit">
        <FormItem v-slot="{ id }" name="summary" label="变更说明" required>
          <Textarea :id="id" rows="3" placeholder="说明本次修改的内容与原因" fluid />
        </FormItem>

        <div class="flex justify-end gap-3">
          <Button
            label="取消"
            severity="secondary"
            :disabled="submitting"
            @click="visible = false"
          />
          <Button label="确认提交" type="submit" :loading="submitting" />
        </div>
      </Form>
    </div>
  </Dialog>
</template>
