<script setup lang="ts">
  import {
    Button,
    Dialog,
    Form,
    FormField,
    Input,
    SegmentedControl,
    Select,
    Stack,
  } from '@hina-ui/vue'
  import { volumeOptions } from '~/features/contribute/manga-options'
  import { useMangaTargets } from '~/features/contribute/useMangaTargets'
  import { MANGA_CHAPTER_TYPE_OPTIONS } from '~/features/workbench/labels'
  import type { BackendMangaProject } from '~/features/workbench/manga/manga'
  import {
    mangaChapterInfoSchema,
    mangaVolumeInfoSchema,
    type MangaChapterInfoValues,
  } from '~/features/workbench/manga/schemas/manga.schema'
  import { getFieldErrors } from '~/utils/api/error'

  const props = withDefaults(
    defineProps<{
      project: Pick<
        BackendMangaProject,
        'id' | 'scope' | 'chapter_type' | 'chapter_number' | 'chapter_name' | 'volume_id'
      > & { series: { id: number } }
      purpose?: 'edit' | 'approve'
    }>(),
    { purpose: 'edit' },
  )
  const visible = defineModel<boolean>('visible', { required: true })
  const emit = defineEmits<{ saved: [] }>()

  const SCOPE_OPTIONS = [
    { value: 'CHAPTER', label: '一话' },
    { value: 'VOLUME', label: '整卷' },
  ]
  const form = useTemplateRef<InstanceType<typeof Form>>('form')
  const submitting = ref(false)
  const values = reactive<MangaChapterInfoValues & { scope: BackendMangaProject['scope'] }>({
    scope: 'CHAPTER',
    chapter_type: 'SERIALIZATION',
    chapter_number: '',
    chapter_name: '',
    volume_id: null,
  })
  const wholeVolume = computed(() => values.scope === 'VOLUME')
  const { chapters, volumes, claims, loading } = useMangaTargets(() =>
    visible.value ? props.project.series.id : null,
  )
  const choices = computed(() =>
    wholeVolume.value
      ? volumeOptions(
          volumes.value,
          chapters.value,
          claims.value.filter(claim => claim.id !== props.project.id),
        ).filter(option => typeof option.value === 'number')
      : volumes.value.map(volume => ({
          value: volume.id,
          label: volume.name_cn || volume.name || `第 ${volume.volume_number ?? '?'} 卷`,
        })),
  )

  watch(visible, next => {
    if (!next) return
    form.value?.reset()
    values.scope = props.project.scope
    values.chapter_type =
      props.project.chapter_type === 'VOLUME' ? 'SERIALIZATION' : props.project.chapter_type
    values.chapter_number = props.project.chapter_number ?? ''
    values.chapter_name = props.project.chapter_name ?? ''
    values.volume_id = props.project.volume_id
  })

  async function onSubmit() {
    if (submitting.value) return
    submitting.value = true
    try {
      const body = wholeVolume.value
        ? { scope: values.scope, volume_id: values.volume_id ?? null }
        : {
            scope: values.scope,
            chapter_type: values.chapter_type,
            chapter_number: values.chapter_number?.trim() || null,
            chapter_name: values.chapter_name?.trim() || null,
            volume_id: values.volume_id ?? null,
          }
      if (props.purpose === 'approve') {
        await hikariRequest('/api/v3/manga-projects/{project_id}/approve', {
          method: 'post',
          path: { project_id: props.project.id },
          body,
        })
      } else {
        await hikariRequest('/api/v3/manga-projects/{project_id}', {
          method: 'patch',
          path: { project_id: props.project.id },
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
    :title="purpose === 'approve' ? '修正归类' : wholeVolume ? '编辑卷信息' : '编辑话信息'"
    size="sm"
    :locked="submitting"
  >
    <template #content>
      <Form
        ref="form"
        :values="values"
        :rules="wholeVolume ? mangaVolumeInfoSchema : mangaChapterInfoSchema"
        :disabled="submitting"
        @submit="onSubmit"
      >
        <Stack gap="md">
          <FormField name="scope" label="范围">
            <SegmentedControl v-model="values.scope" :options="SCOPE_OPTIONS" />
          </FormField>
          <FormField v-if="!wholeVolume" name="chapter_type" label="类型" required>
            <SegmentedControl v-model="values.chapter_type" :options="MANGA_CHAPTER_TYPE_OPTIONS" />
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
            name="chapter_name"
            label="标题"
            :required="values.chapter_type !== 'SERIALIZATION'"
          >
            <Input v-model="values.chapter_name" />
          </FormField>
          <FormField
            name="volume_id"
            :label="wholeVolume ? '单行本' : '所属单行本'"
            :required="wholeVolume"
          >
            <Select
              v-model="values.volume_id"
              :options="choices"
              :loading="loading"
              :clearable="!wholeVolume"
              :placeholder="wholeVolume ? '选择单行本' : '未归入'"
            />
          </FormField>
        </Stack>
      </Form>
    </template>

    <template #footer>
      <Button variant="ghost" tone="neutral" :disabled="submitting" @click="visible = false">
        取消
      </Button>
      <Button :loading="submitting" @click="form?.submit()">
        {{ purpose === 'approve' ? '保存并通过' : '保存' }}
      </Button>
    </template>
  </Dialog>
</template>
