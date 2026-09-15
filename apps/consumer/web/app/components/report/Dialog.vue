<script setup lang="ts">
  import { Button, Dialog, Form, FormField, Select, Textarea } from '@hina-ui/vue'
  import { push } from 'notivue'
  import {
    REPORT_REASON_OPTIONS,
    toReportBody,
    type ReportBody,
    type ReportReason,
  } from '~/features/report/report'
  import { reportSchema } from '~/features/report/schemas/report.schema'
  import { getFieldErrors } from '~/utils/api/error'

  defineOptions({ name: 'ReportDialog' })

  const props = withDefaults(
    defineProps<{
      title?: string
      submit: (body: ReportBody) => Promise<void>
    }>(),
    { title: '举报内容' },
  )
  const visible = defineModel<boolean>('visible', { required: true })

  const form = useTemplateRef<InstanceType<typeof Form>>('form')
  const submitting = ref(false)
  const values = reactive<{ reason: ReportReason | null; description: string }>({
    reason: null,
    description: '',
  })
  const requiresDescription = computed(() => values.reason === 'OTHER')

  watch(visible, next => {
    if (!next) return
    form.value?.reset()
    values.reason = null
    values.description = ''
  })

  async function onSubmit() {
    const reason = values.reason
    if (!reason || submitting.value) return
    submitting.value = true
    try {
      await props.submit(toReportBody({ reason, description: values.description }))
      push.success({ message: '举报已提交' })
      visible.value = false
    } catch (error) {
      form.value?.setErrors(getFieldErrors(error))
    } finally {
      submitting.value = false
    }
  }
</script>

<template>
  <Dialog v-model:open="visible" :title="title" size="md" :locked="submitting">
    <template #content>
      <Form
        ref="form"
        :values="values"
        :rules="reportSchema"
        :disabled="submitting"
        @submit="onSubmit"
      >
        <FormField name="reason" label="举报原因" required>
          <Select
            v-model="values.reason"
            :options="REPORT_REASON_OPTIONS"
            placeholder="请选择举报原因"
          />
        </FormField>

        <FormField name="description" label="补充说明" :required="requiresDescription">
          <Textarea
            v-model="values.description"
            autosize
            maxlength="500"
            :placeholder="requiresDescription ? '请填写具体原因' : '可补充说明具体原因'"
          />
        </FormField>
      </Form>
    </template>

    <template #footer>
      <Button variant="ghost" tone="neutral" :disabled="submitting" @click="visible = false">
        取消
      </Button>
      <Button tone="danger" :loading="submitting" @click="form?.submit()">提交举报</Button>
    </template>
  </Dialog>
</template>
