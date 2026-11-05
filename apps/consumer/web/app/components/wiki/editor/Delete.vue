<script setup lang="ts">
  import { Button, Dialog, Form, FormField, Textarea, toast } from '@hina-ui/vue'
  import type { EditableEntry } from '~/features/wiki/editor/draft'
  import { reasonSchema } from '~/features/wiki/schemas/governance.schema'

  defineOptions({ name: 'WikiEditorDelete' })

  const props = defineProps<{ entry: EditableEntry }>()
  const emit = defineEmits<{ done: [] }>()
  const open = defineModel<boolean>('open', { required: true })
  const form = useTemplateRef<InstanceType<typeof Form>>('form')
  const values = reactive({ reason: '' })
  const submitting = ref(false)
  const restoring = computed(() => props.entry.deleted)

  watch(open, next => {
    if (!next) return
    form.value?.reset()
    values.reason = ''
  })

  async function submit() {
    submitting.value = true
    try {
      const result = await hikariRequest('/api/v3/wiki/edits', {
        method: 'POST',
        body: {
          operations: [
            { op: restoring.value ? 'restore_entry' : 'delete_entry', entry: props.entry.id },
          ],
          base: [{ entry_id: props.entry.id, revision: props.entry.revision }],
          note: values.reason.trim(),
        },
      })
      toast.success(restoring.value ? '已恢复条目' : '已删除条目', {
        action: {
          label: '查看本次修改',
          onClick: () => void navigateTo(`/create/wiki/changes/${result.edit_id}`),
        },
      })
      open.value = false
      emit('done')
    } finally {
      submitting.value = false
    }
  }
</script>

<template>
  <Dialog
    v-model:open="open"
    :title="restoring ? '恢复条目' : '删除条目'"
    size="sm"
    :locked="submitting"
  >
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
      <Button
        :tone="restoring ? undefined : 'danger'"
        :loading="submitting"
        @click="form?.submit()"
      >
        {{ restoring ? '恢复' : '删除' }}
      </Button>
    </template>
  </Dialog>
</template>
