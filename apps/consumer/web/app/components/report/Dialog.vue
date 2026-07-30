<script setup lang="ts">
  import Form, { type FormInstance, type FormSubmitEvent } from '@primevue/forms/form'
  import { push } from 'notivue'
  import {
    REPORT_REASON_OPTIONS,
    toReportBody,
    type ReportBody,
    type ReportReason,
  } from '~/features/report/report'
  import { reportResolver, type ReportFormValues } from '~/features/report/schemas/report.schema'

  defineOptions({ name: 'ReportDialog' })

  const props = withDefaults(
    defineProps<{
      title?: string
      submit: (body: ReportBody) => Promise<void>
    }>(),
    { title: '举报内容' },
  )
  const visible = defineModel<boolean>('visible', { required: true })

  const formErrors = useFormErrors(reportResolver)
  const form = useTemplateRef<FormInstance>('form')
  const submitting = ref(false)
  const selectedReason = ref<ReportReason | null>(null)
  const requiresDescription = computed(() => selectedReason.value === 'OTHER')

  watch(visible, next => {
    if (!next) return
    formErrors.clear()
    form.value?.reset()
    selectedReason.value = null
  })

  function syncReason(value: unknown) {
    selectedReason.value = (value ?? null) as ReportReason | null
  }

  async function onSubmit(event: FormSubmitEvent) {
    if (!event.valid || submitting.value) return
    submitting.value = true
    try {
      await props.submit(toReportBody(event.values as ReportFormValues))
      push.success({ message: '举报已提交' })
      visible.value = false
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
    :header="title"
    :dismissable-mask="!submitting"
    :close-on-escape="!submitting"
    :style="{ width: '92vw', maxWidth: '30rem' }"
  >
    <Form
      ref="form"
      :resolver="formErrors.resolver"
      class="flex flex-col gap-4"
      @input="formErrors.clear"
      @submit="onSubmit"
    >
      <FormItem v-slot="{ id, errorId }" name="reason" label="举报原因" required>
        <Select
          :input-id="id"
          :aria-describedby="errorId"
          :options="REPORT_REASON_OPTIONS"
          option-label="label"
          option-value="value"
          placeholder="请选择举报原因"
          fluid
          @update:model-value="syncReason"
        />
      </FormItem>

      <FormItem
        v-slot="{ id, errorId }"
        name="description"
        label="补充说明"
        :required="requiresDescription"
      >
        <Textarea
          :id="id"
          :aria-describedby="errorId"
          rows="4"
          maxlength="500"
          auto-resize
          fluid
          :placeholder="requiresDescription ? '请填写具体原因' : '可补充说明具体原因'"
        />
      </FormItem>

      <div class="flex justify-end gap-3 pt-2">
        <Button label="取消" severity="secondary" :disabled="submitting" @click="visible = false" />
        <Button label="提交举报" type="submit" severity="danger" :loading="submitting" />
      </div>
    </Form>
  </Dialog>
</template>
