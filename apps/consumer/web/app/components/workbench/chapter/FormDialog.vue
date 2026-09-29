<script setup lang="ts">
  import { Button, Dialog, Form, FormField, Input, Stack } from '@hina-ui/vue'
  import { chapterSchema, type ChapterValues } from '~/features/workbench/schemas/workbench.schema'
  import type { BackendNovelChapter } from '~/features/workbench/workbench'
  import { getFieldErrors } from '~/utils/api/error'

  const props = defineProps<{
    projectId: number
    chapter: BackendNovelChapter | null
    translation?: boolean
  }>()
  const visible = defineModel<boolean>('visible', { required: true })
  const emit = defineEmits<{ saved: [] }>()

  const form = useTemplateRef<InstanceType<typeof Form>>('form')
  const submitting = ref(false)
  const values = reactive<ChapterValues>({ title: '', source_title: '' })

  watch(visible, next => {
    if (!next) return
    form.value?.reset()
    values.title = props.chapter?.title ?? ''
    values.source_title = props.chapter?.source_title ?? ''
  })

  async function onSubmit() {
    if (submitting.value) return
    submitting.value = true
    try {
      const body = {
        title: values.title.trim(),
        ...(props.translation
          ? { source_title: values.source_title?.trim() ? values.source_title.trim() : null }
          : {}),
      }
      if (props.chapter) {
        await hikariRequest('/api/v3/novel-chapters/{chapter_id}', {
          method: 'PATCH',
          path: { chapter_id: props.chapter.id },
          body,
        })
      } else {
        await hikariRequest('/api/v3/novel-projects/{project_id}/chapters', {
          method: 'POST',
          path: { project_id: props.projectId },
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
    :title="chapter ? '修改章节' : '新增章节'"
    size="sm"
    :locked="submitting"
  >
    <template #content>
      <Form
        ref="form"
        :values="values"
        :rules="chapterSchema"
        :disabled="submitting"
        @submit="onSubmit"
      >
        <Stack gap="md">
          <FormField name="title" label="章节标题" required>
            <Input v-model="values.title" />
          </FormField>
          <FormField v-if="translation" name="source_title" label="原标题">
            <Input v-model="values.source_title" />
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
