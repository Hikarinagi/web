<script setup lang="ts">
  import { Button, Dialog, Form, FormField, Textarea } from '@hina-ui/vue'
  import { rejectReviewGroupApplicationSchema } from '~/features/creator/schemas/governance.schema'
  import { getFieldErrors } from '~/utils/api/error'

  const props = defineProps<{ applicationId: number }>()
  const visible = defineModel<boolean>('visible', { required: true })
  const emit = defineEmits<{ rejected: [] }>()

  const form = useTemplateRef<InstanceType<typeof Form>>('form')
  const submitting = ref(false)
  const values = reactive({ rejection_reason: '' })

  watch(visible, next => {
    if (!next) return
    form.value?.reset()
    values.rejection_reason = ''
  })

  async function onSubmit() {
    if (submitting.value) return
    submitting.value = true
    try {
      await hikariRequest('/api/v3/review-group-applications/{id}/reject', {
        method: 'POST',
        path: { id: props.applicationId },
        body: { rejection_reason: values.rejection_reason.trim() },
      })
      visible.value = false
      emit('rejected')
    } catch (error) {
      form.value?.setErrors(getFieldErrors(error))
    } finally {
      submitting.value = false
    }
  }
</script>

<template>
  <Dialog v-model:open="visible" title="驳回申请" size="md" :locked="submitting">
    <template #content>
      <Form
        ref="form"
        :values="values"
        :rules="rejectReviewGroupApplicationSchema"
        :disabled="submitting"
        @submit="onSubmit"
      >
        <FormField name="rejection_reason" label="驳回理由" required>
          <Textarea
            v-model="values.rejection_reason"
            autosize
            placeholder="说明驳回的原因（将展示给申请人）"
          />
        </FormField>
      </Form>
    </template>

    <template #footer>
      <Button variant="ghost" tone="neutral" :disabled="submitting" @click="visible = false">
        取消
      </Button>
      <Button tone="danger" :loading="submitting" @click="form?.submit()">确认驳回</Button>
    </template>
  </Dialog>
</template>
