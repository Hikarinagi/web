<script setup lang="ts">
  import { Button, Dialog, Form, FormField, Textarea } from '@hina-ui/vue'
  import { dismissSchema, type DismissValues } from '~/features/creator/entry/schemas/todo.schema'

  defineOptions({ name: 'CreatorEntryTodoDismiss' })
  const props = defineProps<{ id: number; text: string }>()
  const emit = defineEmits<{ saved: [] }>()
  const open = defineModel<boolean>('open', { required: true })

  const values = reactive<DismissValues>({ reason: '' })
  const form = useTemplateRef<InstanceType<typeof Form>>('form')
  const submitting = ref(false)

  watch(open, next => {
    if (!next) return
    form.value?.reset()
    values.reason = ''
  })

  async function onSubmit() {
    submitting.value = true
    try {
      await hikariRequest('/api/v3/wiki/todos/{id}/dismissal', {
        method: 'POST',
        path: { id: props.id },
        body: { reason: values.reason.trim() },
      })
      open.value = false
      emit('saved')
    } finally {
      submitting.value = false
    }
  }
</script>

<template>
  <Dialog
    v-model:open="open"
    title="驳回此待完善事项"
    :description="text"
    size="sm"
    :locked="submitting"
  >
    <template #content>
      <Form
        ref="form"
        :values="values"
        :rules="dismissSchema"
        :disabled="submitting"
        @submit="onSubmit"
      >
        <FormField
          name="reason"
          label="原因"
          required
          description="除非证据发生变化，否则该待完善事项将不再出现。"
          description-placement="control"
        >
          <Textarea v-model="values.reason" :rows="3" placeholder="请说明为何这不是问题" />
        </FormField>
      </Form>
    </template>
    <template #footer>
      <Button variant="ghost" tone="neutral" :disabled="submitting" @click="open = false">
        取消
      </Button>
      <Button :loading="submitting" @click="form?.submit()">驳回</Button>
    </template>
  </Dialog>
</template>
