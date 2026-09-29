<script setup lang="ts">
  import { Button, Checkbox, Dialog, Form, FormField, Input, Stack, Textarea } from '@hina-ui/vue'
  import { termSchema, type TermValues } from '~/features/workbench/schemas/workbench.schema'
  import type { BackendNovelTerm } from '~/features/workbench/workbench'
  import { getFieldErrors } from '~/utils/api/error'

  const props = defineProps<{ lightNovelId: number; term: BackendNovelTerm | null }>()
  const visible = defineModel<boolean>('visible', { required: true })
  const emit = defineEmits<{ saved: [] }>()

  const form = useTemplateRef<InstanceType<typeof Form>>('form')
  const submitting = ref(false)
  const values = reactive<TermValues>({ source: '', target: '', note: '', forbidden: false })

  watch(visible, next => {
    if (!next) return
    form.value?.reset()
    values.source = props.term?.source ?? ''
    values.target = props.term?.target ?? ''
    values.note = props.term?.note ?? ''
    values.forbidden = props.term?.forbidden ?? false
  })

  async function onSubmit() {
    if (submitting.value) return
    submitting.value = true
    try {
      const body = {
        source: values.source.trim(),
        target: values.target.trim(),
        note: values.note?.trim() ? values.note.trim() : null,
        forbidden: values.forbidden,
      }
      if (props.term) {
        await hikariRequest('/api/v3/novel-terms/{term_id}', {
          method: 'PATCH',
          path: { term_id: props.term.id },
          body,
        })
      } else {
        await hikariRequest('/api/v3/light-novels/{light_novel_id}/terms', {
          method: 'POST',
          path: { light_novel_id: props.lightNovelId },
          body,
        })
      }
      visible.value = false
      emit('saved')
    } catch (error) {
      form.value?.setErrors(getFieldErrors(error))
    } finally {
      submitting.value = false
    }
  }
</script>

<template>
  <Dialog
    v-model:open="visible"
    :title="term ? '修改术语' : '新增术语'"
    size="sm"
    :locked="submitting"
  >
    <template #content>
      <Form
        ref="form"
        :values="values"
        :rules="termSchema"
        :disabled="submitting"
        @submit="onSubmit"
      >
        <Stack gap="md">
          <FormField name="source" label="原文写法" required>
            <Input v-model="values.source" />
          </FormField>
          <FormField name="target" :label="values.forbidden ? '不应该使用的译法' : '译法'" required>
            <Input v-model="values.target" />
          </FormField>
          <FormField name="note" label="备注">
            <Textarea v-model="values.note" :rows="2" placeholder="发音、出处、用法等" />
          </FormField>
          <FormField name="forbidden">
            <Checkbox v-model="values.forbidden">标记为禁用译法。包含它的译文无法定稿。</Checkbox>
          </FormField>
        </Stack>
      </Form>
    </template>

    <template #footer>
      <Button variant="ghost" tone="neutral" :disabled="submitting" @click="visible = false">
        取消
      </Button>
      <Button :loading="submitting" @click="form?.submit()">保存</Button>
    </template>
  </Dialog>
</template>
