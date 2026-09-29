<script setup lang="ts">
  import {
    Button,
    Dialog,
    FileUpload,
    Form,
    FormField,
    SegmentedControl,
    Stack,
    Text,
  } from '@hina-ui/vue'
  import {
    importBookSchema,
    type ImportBookValues,
  } from '~/features/workbench/schemas/workbench.schema'
  import type { BackendNovelProject, NovelImportDraft } from '~/features/workbench/workbench'
  import { getFieldErrors } from '~/utils/api/error'

  const props = defineProps<{ project: BackendNovelProject; hasEpub: boolean }>()
  const visible = defineModel<boolean>('visible', { required: true })
  const emit = defineEmits<{ preview: [draft: NovelImportDraft] }>()

  const form = useTemplateRef<InstanceType<typeof Form>>('form')
  const submitting = ref(false)
  const values = reactive<ImportBookValues>({ source: 'file', file: null })
  const sources = computed(() => props.project.mode === 'ENTRY' && props.hasEpub)

  const SOURCE_OPTIONS = [
    { value: 'file', label: '上传文件' },
    { value: 'current', label: '本网站现有的 EPUB' },
  ]

  watch(visible, next => {
    if (!next) return
    form.value?.reset()
    values.source = 'file'
    values.file = null
  })

  async function onSubmit() {
    if (submitting.value) return
    submitting.value = true
    try {
      const path = { project_id: props.project.id }
      const file = values.source === 'file' ? values.file : null
      if (file) {
        const body = new FormData()
        body.append('file', file)
        const preview = await hikariRequest('/api/v3/novel-projects/{project_id}/import/preview', {
          method: 'POST',
          path,
          body,
        })
        emit('preview', { preview, file, name: file.name })
      } else {
        const preview = await hikariRequest(
          '/api/v3/novel-projects/{project_id}/import/current/preview',
          { path },
        )
        emit('preview', { preview, file: null, name: '本网站现有的 EPUB' })
      }
      visible.value = false
    } catch (error) {
      form.value?.setErrors(getFieldErrors(error))
    } finally {
      submitting.value = false
    }
  }
</script>

<template>
  <Dialog v-model:open="visible" title="导入正文" size="md" :locked="submitting">
    <template #content>
      <Form
        ref="form"
        :values="values"
        :rules="importBookSchema"
        :disabled="submitting"
        @submit="onSubmit"
      >
        <Stack gap="md">
          <FormField v-if="sources" name="source" label="来源">
            <SegmentedControl v-model="values.source" :options="SOURCE_OPTIONS" />
          </FormField>
          <FormField v-if="values.source === 'file'" name="file" label="文件" required>
            <FileUpload v-model="values.file" accept=".epub,.txt" aria-label="选择文件" />
          </FormField>
          <Text size="sm" tone="muted">
            下一步显示章节。你可以选择要导入的章节，并重命名、合并或拆分它们。
          </Text>
        </Stack>
      </Form>
    </template>

    <template #footer>
      <Button variant="ghost" tone="neutral" :disabled="submitting" @click="visible = false">
        取消
      </Button>
      <Button :loading="submitting" @click="form?.submit()">下一步</Button>
    </template>
  </Dialog>
</template>
