<script setup lang="ts">
  import { Button, Dialog, Form, FormField, Input } from '@hina-ui/vue'
  import type { BackendMangaProject } from '~/features/workbench/manga/manga'
  import {
    mangaHintSchema,
    type MangaHintValues,
  } from '~/features/workbench/manga/schemas/manga.schema'
  import { getFieldErrors } from '~/utils/api/error'

  const props = defineProps<{ project: Pick<BackendMangaProject, 'id' | 'hint'> }>()
  const visible = defineModel<boolean>('visible', { required: true })
  const emit = defineEmits<{ saved: [] }>()

  const form = useTemplateRef<InstanceType<typeof Form>>('form')
  const submitting = ref(false)
  const values = reactive<MangaHintValues>({ hint: '' })

  watch(visible, next => {
    if (!next) return
    form.value?.reset()
    values.hint = props.project.hint ?? ''
  })

  async function onSubmit() {
    if (submitting.value) return
    submitting.value = true
    try {
      await hikariRequest('/api/v3/manga-projects/{project_id}', {
        method: 'patch',
        path: { project_id: props.project.id },
        body: { hint: values.hint?.trim() || null },
      })
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
  <Dialog v-model:open="visible" title="卷号或话号" size="sm" :locked="submitting">
    <template #content>
      <Form
        ref="form"
        :values="values"
        :rules="mangaHintSchema"
        :disabled="submitting"
        @submit="onSubmit"
      >
        <FormField name="hint" label="卷号或话号">
          <Input v-model="values.hint" placeholder="例如：第 3 卷、第 17 至 20 话" />
        </FormField>
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
