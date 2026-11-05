<script setup lang="ts">
  import { Button, Dialog, Form, FormField, Textarea, toast } from '@hina-ui/vue'
  import { ENTRY_PAGE } from '~/features/wiki/editor/page'
  import { reasonSchema } from '~/features/wiki/schemas/governance.schema'

  defineOptions({ name: 'WikiEditorDismiss' })

  const props = defineProps<{ suggestion: number | null }>()
  const open = defineModel<boolean>('open', { required: true })
  const form = useTemplateRef<InstanceType<typeof Form>>('form')
  const values = reactive({ reason: '' })
  const submitting = ref(false)
  const page = inject(ENTRY_PAGE)!

  watch(open, next => {
    if (!next) return
    form.value?.reset()
    values.reason = ''
  })

  async function submit() {
    if (props.suggestion === null) return
    submitting.value = true
    try {
      await hikariRequest('/api/v3/wiki/todos/{id}/dismissal', {
        method: 'POST',
        path: { id: props.suggestion },
        body: { reason: values.reason.trim() },
      })
      toast.success('已驳回')
      open.value = false
      page.refresh()
    } finally {
      submitting.value = false
    }
  }
</script>

<template>
  <Dialog v-model:open="open" title="驳回建议" size="sm" :locked="submitting">
    <template #content>
      <Form
        ref="form"
        :values="values"
        :rules="reasonSchema"
        :disabled="submitting"
        @submit="submit"
      >
        <FormField name="reason" label="理由" required>
          <Textarea v-model="values.reason" :min-rows="2" />
        </FormField>
      </Form>
    </template>
    <template #footer>
      <Button variant="ghost" tone="neutral" :disabled="submitting" @click="open = false">
        取消
      </Button>
      <Button tone="danger" :loading="submitting" @click="form?.submit()">驳回</Button>
    </template>
  </Dialog>
</template>
