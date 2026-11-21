<script setup lang="ts">
  import {
    Button,
    Dialog,
    Form,
    FormField,
    Inline,
    Input,
    SegmentedControl,
    Select,
    Stack,
    Switch,
  } from '@hina-ui/vue'
  import { volumeOptions } from '~/features/contribute/manga-options'
  import { useMangaTargets } from '~/features/contribute/useMangaTargets'
  import { MANGA_CHAPTER_TYPE_OPTIONS } from '~/features/workbench/labels'
  import type { BackendMangaProject } from '~/features/workbench/manga/manga'
  import {
    mangaChapterInfoSchema,
    mangaVolumeInfoSchema,
    type MangaChapterInfoValues,
    type MangaVolumeInfoValues,
  } from '~/features/workbench/manga/schemas/manga.schema'
  import { getFieldErrors } from '~/utils/api/error'

  const props = withDefaults(
    defineProps<{
      project: Pick<
        BackendMangaProject,
        | 'id'
        | 'mode'
        | 'scope'
        | 'chapter_type'
        | 'chapter_number'
        | 'chapter_name'
        | 'volume_id'
        | 'part'
        | 'part_count'
        | 'alternate'
      > & { series: { id: number } }
      purpose?: 'edit' | 'approve' | 'correct' | 'resume'
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
  const values = reactive<
    MangaChapterInfoValues &
      Pick<MangaVolumeInfoValues, 'part' | 'part_count'> & { scope: BackendMangaProject['scope'] }
  >({
    scope: 'CHAPTER',
    chapter_type: 'SERIALIZATION',
    chapter_number: '',
    chapter_name: '',
    volume_id: null,
    part: null,
    part_count: null,
  })
  const alternate = ref(false)
  const reviewing = computed(() => props.purpose !== 'edit')
  const wholeVolume = computed(() => values.scope === 'VOLUME')
  const { chapters, volumes, claims, published, loading } = useMangaTargets(() =>
    visible.value ? props.project.series.id : null,
  )
  const others = computed(() => ({
    claims: claims.value.filter(claim => claim.id !== props.project.id),
    published: published.value.filter(project => project.id !== props.project.id),
  }))
  const choices = computed(() =>
    wholeVolume.value
      ? volumeOptions(
          volumes.value,
          chapters.value,
          others.value.claims,
          props.purpose === 'correct' || props.purpose === 'resume'
            ? { published: others.value.published, upload: props.project.mode === 'UPLOAD' }
            : {},
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
    values.part = props.project.part
    values.part_count = props.project.part_count
    alternate.value = props.project.alternate
  })

  async function onSubmit() {
    if (submitting.value) return
    submitting.value = true
    try {
      const body = wholeVolume.value
        ? {
            scope: values.scope,
            volume_id: values.volume_id ?? null,
            part: values.part ?? null,
            part_count: values.part == null ? null : (values.part_count ?? null),
          }
        : {
            scope: values.scope,
            chapter_type: values.chapter_type,
            chapter_number: values.chapter_number?.trim() || null,
            chapter_name: values.chapter_name?.trim() || null,
            volume_id: values.volume_id ?? null,
          }
      const path = { project_id: props.project.id }
      const decided = { ...body, alternate: alternate.value }
      if (props.purpose === 'approve') {
        await hikariRequest('/api/v3/manga-projects/{project_id}/approve', {
          method: 'post',
          path,
          body: decided,
        })
      } else if (props.purpose === 'resume') {
        await hikariRequest('/api/v3/manga-projects/{project_id}/resume', {
          method: 'post',
          path,
          body: decided,
        })
      } else if (props.purpose === 'correct') {
        await hikariRequest('/api/v3/manga-projects/{project_id}/placement', {
          method: 'put',
          path,
          body: decided,
        })
      } else {
        await hikariRequest('/api/v3/manga-projects/{project_id}', { method: 'patch', path, body })
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
    :title="
      purpose === 'resume'
        ? '重新指定卷与部分'
        : purpose === 'edit'
          ? wholeVolume
            ? '编辑卷信息'
            : '编辑话信息'
          : '修正归类'
    "
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
          <ContributeMangaPartField
            v-if="wholeVolume"
            v-model:part="values.part"
            v-model:count="values.part_count"
            :volume="volumes.find(volume => volume.id === values.volume_id)"
            :claims="others.claims"
            :published="others.published"
          />
          <FormField v-if="reviewing" name="alternate">
            <Inline gap="xs" align="center" :wrap="false">
              <Switch v-model="alternate">设为替代来源</Switch>
              <Question title="替代来源" aria-label="查看替代来源的说明">
                这一卷或这一话已有其他投稿发布的内容时，只有设为替代来源的投稿才能发布到这里。替代来源与已有内容并存，读者看到哪一份由选源决定。
              </Question>
            </Inline>
          </FormField>
        </Stack>
      </Form>
    </template>

    <template #footer>
      <Button variant="ghost" tone="neutral" :disabled="submitting" @click="visible = false">
        取消
      </Button>
      <Button :loading="submitting" @click="form?.submit()">
        {{ purpose === 'approve' ? '保存并通过' : purpose === 'resume' ? '保存并恢复' : '保存' }}
      </Button>
    </template>
  </Dialog>
</template>
