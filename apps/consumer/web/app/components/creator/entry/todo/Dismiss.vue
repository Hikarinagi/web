<script setup lang="ts">
  import { Button, Dialog, Form, FormField, Textarea } from '@hina-ui/vue'
  import { dismissSchema, type DismissValues } from '~/features/creator/entry/schemas/todo.schema'

  defineOptions({ name: 'CreatorEntryTodoDismiss' })
  const props = defineProps<{ id: number }>()
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
  <Dialog v-model:open="open" title="驳回此事项" size="sm" :locked="submitting">
    <template #content>
      <Form
        ref="form"
        :values="values"
        :rules="dismissSchema"
        :disabled="submitting"
        @submit="onSubmit"
      >
        <FormField name="reason" required>
          <template #label>
            理由
            <CreatorEntryHint name="dismiss" class="ms-1 align-middle" />
          </template>
          <Textarea v-model="values.reason" :rows="3" placeholder="必填" />
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
