<script setup lang="ts">
  import {
    Button,
    Checkbox,
    Dialog,
    FileUpload,
    Form,
    FormField,
    SegmentedControl,
    Stack,
    toast,
  } from '@hina-ui/vue'
  import type { BackendMangaProject } from '~/features/workbench/manga/manga'
  import {
    importLabelPlusSchema,
    type ImportLabelPlusValues,
  } from '~/features/workbench/manga/schemas/manga.schema'
  import { getFieldErrors } from '~/utils/api/error'

  const props = defineProps<{ project: BackendMangaProject }>()
  const visible = defineModel<boolean>('visible', { required: true })
  const emit = defineEmits<{ imported: [] }>()

  const form = useTemplateRef<InstanceType<typeof Form>>('form')
  const submitting = ref(false)
  const values = reactive<ImportLabelPlusValues>({ file: null, target: 'source', replace: false })

  const targetOptions = computed(() => [
    { value: 'source', label: '作为原文' },
    ...(props.project.mode === 'TRANSLATION' ? [{ value: 'translation', label: '作为译文' }] : []),
  ])
  const manage = computed(() => props.project.viewer_capabilities.includes('manage'))

  watch(visible, next => {
    if (!next) return
    form.value?.reset()
    values.file = null
    values.target = props.project.mode === 'TRANSLATION' ? 'translation' : 'source'
    values.replace = false
  })

  async function onSubmit() {
    if (!values.file || submitting.value) return
    submitting.value = true
    try {
      const result = await hikariRequest('/api/v3/manga-projects/{project_id}/labelplus', {
        method: 'post',
        path: { project_id: props.project.id },
        body: {
          content: await values.file.text(),
          target: values.target,
          replace: values.replace,
        },
      })
      toast.success(
        result.skipped_pages
          ? `已导入 ${result.pages} 个页面和 ${result.regions} 个文本框。文件中的 ${result.skipped_pages} 个额外页面已被跳过。`
          : `已导入 ${result.pages} 个页面和 ${result.regions} 个文本框`,
      )
      visible.value = false
      emit('imported')
    } catch (error) {
      form.value?.setErrors(getFieldErrors(error))
    } finally {
      submitting.value = false
    }
  }
</script>

<template>
  <Dialog v-model:open="visible" title="导入 LabelPlus 翻译稿" size="md" :locked="submitting">
    <template #content>
      <Form
        ref="form"
        :values="values"
        :rules="importLabelPlusSchema"
        :disabled="submitting"
        @submit="onSubmit"
      >
        <Stack gap="md">
          <FormField
            name="file"
            label="翻译稿"
            description="文件中的页面按顺序与本章的页面匹配。文件名不需要匹配。"
            description-placement="control"
            required
          >
            <FileUpload v-model="values.file" accept=".txt" aria-label="选择翻译稿" />
          </FormField>
          <FormField name="target" label="稿中的文字">
            <SegmentedControl v-model="values.target" :options="targetOptions" />
          </FormField>
          <FormField v-if="manage" name="replace">
            <Checkbox v-model="values.replace">首先清除匹配页面上的现有文本框</Checkbox>
          </FormField>
        </Stack>
      </Form>
    </template>

    <template #footer>
      <Button variant="ghost" tone="neutral" :disabled="submitting" @click="visible = false">
        取消
      </Button>
      <Button :loading="submitting" @click="form?.submit()">导入</Button>
    </template>
  </Dialog>
</template>
