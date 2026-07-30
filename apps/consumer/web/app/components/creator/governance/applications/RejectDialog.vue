<script setup lang="ts">
  import Form, { type FormInstance, type FormSubmitEvent } from '@primevue/forms/form'
  import {
    rejectReviewGroupApplicationResolver,
    type RejectReviewGroupApplicationValues,
  } from '~/features/creator/schemas/governance.schema'

  const props = defineProps<{ applicationId: number }>()
  const visible = defineModel<boolean>('visible', { required: true })
  const emit = defineEmits<{ rejected: [] }>()

  const formErrors = useFormErrors(rejectReviewGroupApplicationResolver)
  const form = useTemplateRef<FormInstance>('form')
  const submitting = ref(false)

  watch(visible, next => {
    if (next) {
      formErrors.clear()
      form.value?.reset()
    }
  })

  async function onSubmit(event: FormSubmitEvent) {
    if (!event.valid || submitting.value) return
    submitting.value = true
    try {
      const values = event.values as RejectReviewGroupApplicationValues
      await hikariRequest('/api/v3/review-group-applications/{id}/reject', {
        method: 'POST',
        path: { id: props.applicationId },
        body: { rejection_reason: values.rejection_reason },
      })
      visible.value = false
      emit('rejected')
    } catch (error) {
      await formErrors.apply(error, form.value)
    } finally {
      submitting.value = false
    }
  }
</script>

<template>
  <Dialog
    v-model:visible="visible"
    modal
    header="驳回申请"
    :dismissable-mask="!submitting"
    :style="{ width: '92vw', maxWidth: '28rem' }"
  >
    <Form
      ref="form"
      :resolver="formErrors.resolver"
      class="flex flex-col gap-4"
      @input="formErrors.clear"
      @submit="onSubmit"
    >
      <FormItem v-slot="{ id }" name="rejection_reason" label="驳回理由" required>
        <Textarea :id="id" rows="4" fluid placeholder="说明驳回的原因(将展示给申请人)" />
      </FormItem>

      <div class="flex justify-end gap-3 pt-2">
        <Button label="取消" severity="secondary" :disabled="submitting" @click="visible = false" />
        <Button label="确认驳回" type="submit" severity="danger" :loading="submitting" />
      </div>
    </Form>
  </Dialog>
</template>
