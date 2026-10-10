<script setup lang="ts">
  import {
    Button,
    DatePicker,
    Dialog,
    Form,
    FormField,
    Input,
    SegmentedControl,
    Select,
    Stack,
  } from '@hina-ui/vue'
  import { useVolumeOptions } from '~/features/manga/composables/useVolumeOptions'
  import {
    mangaChapterEditSchema,
    type MangaChapterEditValues,
  } from '~/features/manga/schemas/chapter.schema'
  import { MANGA_CHAPTER_TYPE_OPTIONS } from '~/features/workbench/labels'
  import { getFieldErrors } from '~/utils/api/error'

  const props = defineProps<{
    seriesId: number
    chapter: {
      id: number
      chapter_type: MangaChapterEditValues['chapter_type']
      chapter_number: string | null
      name: string | null
      volume_id: number | null
      publication_date: string | null
    } | null
  }>()
  const visible = defineModel<boolean>('visible', { required: true })
  const emit = defineEmits<{ saved: [] }>()

  const TYPE_OPTIONS = [...MANGA_CHAPTER_TYPE_OPTIONS, { value: 'VOLUME', label: '整卷' }]
  const form = useTemplateRef<InstanceType<typeof Form>>('form')
  const submitting = ref(false)
  const values = reactive<MangaChapterEditValues>({
    chapter_type: 'SERIALIZATION',
    chapter_number: '',
    name: '',
    volume_id: null,
    publication_date: '',
  })
  const wholeVolume = computed(() => values.chapter_type === 'VOLUME')
  const { options, loading } = useVolumeOptions(() => (visible.value ? props.seriesId : null))

  watch(visible, next => {
    if (!next || !props.chapter) return
    form.value?.reset()
    values.chapter_type = props.chapter.chapter_type
    values.chapter_number = props.chapter.chapter_number ?? ''
    values.name = props.chapter.name ?? ''
    values.volume_id = props.chapter.volume_id
    values.publication_date = props.chapter.publication_date?.slice(0, 10) ?? ''
  })

  async function onSubmit() {
    if (submitting.value || !props.chapter) return
    submitting.value = true
    try {
      await hikariRequest('/api/v3/manga-chapters/{id}', {
        method: 'patch',
        path: { id: props.chapter.id },
        body: {
          chapter_type: values.chapter_type,
          chapter_number: wholeVolume.value ? null : values.chapter_number?.trim() || null,
          name: wholeVolume.value ? null : values.name?.trim() || null,
          volume_id: values.volume_id ?? null,
          publication_date: values.publication_date || null,
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
  <Dialog
    v-model:open="visible"
    :title="wholeVolume ? '编辑卷信息' : '编辑话信息'"
    size="sm"
    :locked="submitting"
  >
    <template #content>
      <Form
        ref="form"
        :values="values"
        :rules="mangaChapterEditSchema"
        :disabled="submitting"
        @submit="onSubmit"
      >
        <Stack gap="md">
          <FormField name="chapter_type" label="类型" required>
            <SegmentedControl v-model="values.chapter_type" :options="TYPE_OPTIONS" />
          </FormField>
          <FormField
            v-if="!wholeVolume"
            name="chapter_number"
            label="话数"
            :required="values.chapter_type === 'SERIALIZATION'"
          >
            <Input v-model="values.chapter_number" placeholder="12" />
          </FormField>
          <FormField
            v-if="!wholeVolume"
            name="name"
            label="标题"
            :required="values.chapter_type !== 'SERIALIZATION'"
          >
            <Input v-model="values.name" />
          </FormField>
          <FormField
            name="volume_id"
            :label="wholeVolume ? '单行本' : '所属单行本'"
            :required="wholeVolume"
          >
            <Select
              v-model="values.volume_id"
              :options="options"
              :loading="loading"
              :clearable="!wholeVolume"
              :placeholder="wholeVolume ? '选择单行本' : '未归入'"
            />
          </FormField>
          <FormField name="publication_date" label="发表日期">
            <DatePicker v-model="values.publication_date" clearable />
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
