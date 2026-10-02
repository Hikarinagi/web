<script setup lang="ts">
  import {
    Button,
    Dialog,
    Form,
    FormField,
    Input,
    NumberInput,
    SegmentedControl,
    Select,
    Stack,
    Text,
    toast,
  } from '@hina-ui/vue'
  import { WIKI_PERMISSIONS } from '@hikarinagi/shared'
  import type { WorkbenchMangaProjectPageData } from '~~/server/api/pages/create/manga/[id].get'
  import type { MangaTargetVolume } from '~/features/contribute/manga-target'
  import type { BackendMangaProject } from '~/features/workbench/manga/manga'
  import {
    mangaChapterInfoSchema,
    mangaVolumeInfoSchema,
    type MangaChapterInfoValues,
  } from '~/features/workbench/manga/schemas/manga.schema'
  import { getFieldErrors } from '~/utils/api/error'
  import { getMangaVolumeLabel } from '~/utils/media/manga'

  const props = defineProps<{
    project: BackendMangaProject
    chapter: WorkbenchMangaProjectPageData['chapter']
  }>()
  const visible = defineModel<boolean>('visible', { required: true })
  const emit = defineEmits<{ saved: [] }>()

  const NONE = 0
  const SCOPE_OPTIONS = [
    { value: 'CHAPTER', label: '单话' },
    { value: 'VOLUME', label: '整卷' },
  ]
  const { canAny } = useCreatorPermissions()
  const form = useTemplateRef<InstanceType<typeof Form>>('form')
  const submitting = ref(false)
  const volumes = shallowRef<MangaTargetVolume[]>([])
  const values = reactive<MangaChapterInfoValues & { scope: BackendMangaProject['scope'] }>({
    scope: 'CHAPTER',
    chapter_number: '',
    chapter_name: '',
    volume_number: null,
    volume_id: null,
  })
  const wholeVolume = computed(
    () => (props.chapter ? props.project.scope : values.scope) === 'VOLUME',
  )
  const reviewed = computed(() => !!props.chapter && !canAny(WIKI_PERMISSIONS.REVIEW))
  const volumeOptions = computed(() => [
    { value: NONE, label: '未收录' },
    ...volumes.value.map(volume => ({ value: volume.id, label: getMangaVolumeLabel(volume) })),
  ])
  const volume = computed({
    get: () => values.volume_id ?? NONE,
    set: value => {
      values.volume_id = value === NONE ? null : Number(value)
    },
  })

  watch(visible, async next => {
    if (!next) return
    form.value?.reset()
    values.scope = props.project.scope
    if (!props.chapter) {
      values.chapter_number = props.project.chapter_number ?? ''
      values.chapter_name = props.project.chapter_name ?? ''
      values.volume_number = props.project.volume_number
      return
    }
    values.chapter_number = props.chapter.chapter_number ?? ''
    values.chapter_name = props.chapter.name ?? ''
    values.volume_id = props.chapter.volume_id
    if (!volumes.value.length) {
      volumes.value = await hikariRequest('/api/v3/mangas/{id}/volumes', {
        path: { id: props.project.series.id },
        toast: false,
      }).catch(() => [])
    }
  })

  async function submitChange(chapter: NonNullable<WorkbenchMangaProjectPageData['chapter']>) {
    const next = {
      chapter_number: wholeVolume.value
        ? chapter.chapter_number
        : values.chapter_number?.trim() || null,
      name: values.chapter_name?.trim() || null,
      volume_id: values.volume_id ?? null,
    }
    const changeset = (Object.keys(next) as (keyof typeof next)[])
      .filter(field => next[field] !== chapter[field])
      .map(field => ({ kind: 'scalar', field, from: chapter[field], to: next[field] }))
    if (!changeset.length) return
    const change = await hikariRequest('/api/v3/manga-chapters/{id}/change-requests', {
      method: 'post',
      path: { id: chapter.id },
      body: { summary: '更新章节信息', changeset },
    })
    toast.success(change.status === 'MERGED' ? '已保存' : '已提交。审核后生效。')
  }

  async function onSubmit() {
    if (submitting.value) return
    submitting.value = true
    try {
      if (props.chapter) {
        await submitChange(props.chapter)
      } else {
        await hikariRequest('/api/v3/manga-projects/{project_id}', {
          method: 'patch',
          path: { project_id: props.project.id },
          body: wholeVolume.value
            ? { scope: values.scope, volume_number: values.volume_number ?? null }
            : {
                scope: values.scope,
                chapter_number: values.chapter_number?.trim() || null,
                chapter_name: values.chapter_name?.trim() || null,
                volume_number: values.volume_number ?? null,
              },
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
    :title="project.scope === 'VOLUME' ? '编辑卷信息' : '编辑话信息'"
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
          <Text v-if="reviewed" size="sm" tone="muted">对已发布章节的更改在审核后生效。</Text>
          <FormField v-if="!chapter" name="scope" label="范围">
            <SegmentedControl v-model="values.scope" :options="SCOPE_OPTIONS" />
          </FormField>
          <FormField v-if="!wholeVolume" name="chapter_number" label="话数">
            <Input v-model="values.chapter_number" placeholder="12" />
          </FormField>
          <FormField v-if="!wholeVolume || chapter" name="chapter_name" label="标题">
            <Input v-model="values.chapter_name" />
          </FormField>
          <FormField v-if="chapter" name="volume_id" :label="wholeVolume ? '对应单行本' : '所在卷'">
            <Select v-model="volume" :options="volumeOptions" />
          </FormField>
          <FormField
            v-else
            name="volume_number"
            :label="wholeVolume ? '卷号' : '所在卷'"
            :required="wholeVolume"
          >
            <NumberInput
              v-model="values.volume_number"
              :min="0"
              :placeholder="wholeVolume ? '3' : '未收录'"
            />
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
