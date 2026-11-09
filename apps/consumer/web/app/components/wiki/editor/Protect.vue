<script setup lang="ts">
  import { Button, DateField, Dialog, Form, FormField, Textarea, toast } from '@hina-ui/vue'
  import type { EditableEntry } from '~/features/wiki/editor/draft'
  import { protectSchema, reasonSchema } from '~/features/wiki/schemas/governance.schema'

  defineOptions({ name: 'WikiEditorProtect' })

  const props = defineProps<{ entry: EditableEntry }>()
  const emit = defineEmits<{ done: [] }>()
  const open = defineModel<boolean>('open', { required: true })
  const form = useTemplateRef<InstanceType<typeof Form>>('form')
  const values = reactive<{ reason: string; until: string | null }>({ reason: '', until: null })
  const submitting = ref(false)
  const locked = computed(() => Boolean(props.entry.protection))

  watch(open, next => {
    if (!next) return
    form.value?.reset()
    values.reason = ''
    values.until = null
  })

  async function submit() {
    submitting.value = true
    try {
      const reason = values.reason.trim()
      if (locked.value)
        await hikariRequest<'/api/v3/wiki/entries/{id}/protection', 'delete'>(
          '/api/v3/wiki/entries/{id}/protection',
          {
            method: 'DELETE',
            path: { id: props.entry.id },
            query: { reason },
          },
        )
      else
        await hikariRequest('/api/v3/wiki/entries/{id}/protection', {
          method: 'PUT',
          path: { id: props.entry.id },
          body: { reason, until: values.until },
        })
      toast.success(locked.value ? '已解除锁定' : '已锁定')
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
    :title="locked ? '解除锁定' : '锁定条目'"
    size="sm"
    :locked="submitting"
  >
    <template #content>
      <Form
        ref="form"
        :values="values"
        :rules="locked ? reasonSchema : protectSchema"
        :disabled="submitting"
        @submit="submit"
      >
        <FormField name="reason" label="理由" required>
          <Textarea v-model="values.reason" :min-rows="2" />
        </FormField>
        <FormField v-if="!locked" name="until" label="到期">
          <DateField v-model="values.until" clearable />
        </FormField>
      </Form>
    </template>
    <template #footer>
      <Button variant="ghost" tone="neutral" :disabled="submitting" @click="open = false">
        取消
      </Button>
      <Button :loading="submitting" @click="form?.submit()">
        {{ locked ? '解除锁定' : '锁定' }}
      </Button>
    </template>
  </Dialog>
</template>
