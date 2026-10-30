<script setup lang="ts">
  import { Button, Dialog, Form, FormField, Textarea, toast } from '@hina-ui/vue'
  import {
    objectionSchema,
    type ObjectionValues,
  } from '~/features/creator/entry/schemas/notice.schema'

  defineOptions({ name: 'CreatorNoticesObject' })
  const props = defineProps<{ id: number; summary: string }>()
  const emit = defineEmits<{ saved: [] }>()
  const open = defineModel<boolean>('open', { required: true })

  const values = reactive<ObjectionValues>({ reason: '' })
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
      await hikariRequest('/api/v3/wiki/edits/{id}/objections', {
        method: 'POST',
        path: { id: props.id },
        body: { reason: values.reason.trim() },
      })
      open.value = false
      toast.success('反对已记录')
      emit('saved')
    } finally {
      submitting.value = false
    }
  }
</script>

<template>
  <Dialog
    v-model:open="open"
    title="反对此次编辑"
    :description="summary"
    size="sm"
    :locked="submitting"
  >
    <template #content>
      <Form
        ref="form"
        :values="values"
        :rules="objectionSchema"
        :disabled="submitting"
        @submit="onSubmit"
      >
        <FormField
          name="reason"
          label="原因"
          required
          description="有成员反对的编辑不会自行生效，须由巡查者决定。"
          description-placement="control"
        >
          <Textarea v-model="values.reason" :rows="3" placeholder="说明此编辑存在的问题" />
        </FormField>
      </Form>
    </template>
    <template #footer>
      <Button variant="ghost" tone="neutral" :disabled="submitting" @click="open = false">
        取消
      </Button>
      <Button tone="danger" :loading="submitting" @click="form?.submit()">反对</Button>
    </template>
  </Dialog>
</template>
