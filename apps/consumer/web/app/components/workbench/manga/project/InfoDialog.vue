<script setup lang="ts">
  import { Button, Dialog, Form, FormField, Input, NumberInput, Stack } from '@hina-ui/vue'
  import type { BackendMangaProject } from '~/features/workbench/manga/manga'
  import {
    mangaChapterInfoSchema,
    type MangaChapterInfoValues,
  } from '~/features/workbench/manga/schemas/manga.schema'
  import { getFieldErrors } from '~/utils/api/error'

  const props = defineProps<{ project: BackendMangaProject }>()
  const visible = defineModel<boolean>('visible', { required: true })
  const emit = defineEmits<{ saved: [] }>()

  const form = useTemplateRef<InstanceType<typeof Form>>('form')
  const submitting = ref(false)
  const values = reactive<MangaChapterInfoValues>({
    chapter_number: '',
    chapter_name: '',
    volume_number: null,
  })

  watch(visible, next => {
    if (!next) return
    form.value?.reset()
    values.chapter_number = props.project.chapter_number ?? ''
    values.chapter_name = props.project.chapter_name ?? ''
    values.volume_number = props.project.volume_number
  })

  async function onSubmit() {
    if (submitting.value) return
    submitting.value = true
    try {
      await hikariRequest('/api/v3/manga-projects/{project_id}', {
        method: 'patch',
        path: { project_id: props.project.id },
        body: {
          chapter_number: values.chapter_number?.trim() || null,
          chapter_name: values.chapter_name?.trim() || null,
          volume_number: values.volume_number ?? null,
        },
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
  <Dialog v-model:open="visible" title="编辑话信息" size="sm" :locked="submitting">
    <template #content>
      <Form
        ref="form"
        :values="values"
        :rules="mangaChapterInfoSchema"
        :disabled="submitting"
        @submit="onSubmit"
      >
        <Stack gap="md">
          <FormField name="chapter_number" label="话数">
            <Input v-model="values.chapter_number" placeholder="留空以将其作为番外发布" />
          </FormField>
          <FormField name="chapter_name" label="标题">
            <Input v-model="values.chapter_name" />
          </FormField>
          <FormField name="volume_number" label="所在卷">
            <NumberInput v-model="values.volume_number" :min="0" placeholder="未收录" />
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
