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
    Switch,
  } from '@hina-ui/vue'
  import { volumeOptions } from '~/features/contribute/manga-options'
  import { useMangaTargets } from '~/features/contribute/useMangaTargets'
  import { MANGA_PLACE_OPTIONS } from '~/features/workbench/labels'
  import type { BackendMangaProject } from '~/features/workbench/manga/manga'
  import {
    mangaChapterInfoSchema,
    mangaVolumeInfoSchema,
    type MangaChapterInfoValues,
  } from '~/features/workbench/manga/schemas/manga.schema'
  import { getFieldErrors } from '~/utils/api/error'

  const props = defineProps<{
    project: Pick<
      BackendMangaProject,
      | 'id'
      | 'mode'
      | 'status'
      | 'scope'
      | 'chapter_type'
      | 'chapter_number'
      | 'chapter_name'
      | 'volume_id'
      | 'alternate'
      | 'hint'
      | 'placement'
      | 'placement_complete'
    > & { series: { id: number } }
    purpose: 'approve' | 'resume'
  }>()
  const visible = defineModel<boolean>('visible', { required: true })
  const emit = defineEmits<{ saved: [] }>()

  const form = useTemplateRef<InstanceType<typeof Form>>('form')
  const submitting = ref(false)
  const values = reactive<
    Omit<MangaChapterInfoValues, 'chapter_type'> & {
      chapter_type: MangaChapterInfoValues['chapter_type'] | 'VOLUME'
    }
  >({ chapter_type: 'SERIALIZATION', chapter_number: '', chapter_name: '', volume_id: null })
  const alternate = ref(false)
  const wholeVolume = computed(() => values.chapter_type === 'VOLUME')
  const guess = computed(() => (props.project.placement_complete ? null : props.project.placement))
  const { chapters, volumes, sets, setId, claims, published, loading } = useMangaTargets(
    () => (visible.value ? props.project.series.id : null),
    () => props.project.volume_id ?? guess.value?.wiki_volume ?? null,
  )
  const choices = computed(() =>
    wholeVolume.value
      ? volumeOptions(
          volumes.value,
          chapters.value,
          claims.value.filter(claim => claim.id !== props.project.id),
          props.purpose === 'approve'
            ? {}
            : {
                published: published.value.filter(project => project.id !== props.project.id),
                upload: props.project.mode === 'UPLOAD',
              },
        )
      : volumes.value.map(volume => ({
          value: volume.id,
          label: volume.name_cn || volume.name || `第 ${volume.volume_number ?? '?'} 卷`,
        })),
  )

  watch(visible, next => {
    if (!next) return
    form.value?.reset()
    const { project } = props
    const single = guess.value?.kind === 'chapters' && guess.value.first === guess.value.last
    values.chapter_type =
      guess.value?.kind === 'volume' || (!guess.value && project.scope === 'VOLUME')
        ? 'VOLUME'
        : guess.value?.kind === 'extra'
          ? 'EXTRA'
          : project.chapter_type === 'VOLUME'
            ? 'SERIALIZATION'
            : project.chapter_type
    values.chapter_number =
      project.chapter_number ?? (single ? String(guess.value?.first ?? '') : '')
    values.chapter_name = project.chapter_name ?? ''
    values.volume_id =
      project.volume_id ?? (guess.value?.kind === 'volume' ? guess.value.wiki_volume : null)
    alternate.value = project.alternate
  })

  async function onSubmit() {
    if (submitting.value) return
    submitting.value = true
    try {
      const body =
        values.chapter_type === 'VOLUME'
          ? {
              scope: 'VOLUME' as const,
              volume_id: values.volume_id ?? null,
              set_entry_id: setId.value,
              alternate: alternate.value,
            }
          : {
              scope: 'CHAPTER' as const,
              chapter_type: values.chapter_type,
              chapter_number: values.chapter_number?.trim() || null,
              chapter_name: values.chapter_name?.trim() || null,
              volume_id: values.volume_id ?? null,
              set_entry_id: values.volume_id ? setId.value : null,
              alternate: alternate.value,
            }
      const request = { method: 'post' as const, path: { project_id: props.project.id }, body }
      if (props.purpose === 'approve') {
        await hikariRequest('/api/v3/manga-projects/{project_id}/approve', request)
      } else {
        await hikariRequest('/api/v3/manga-projects/{project_id}/resume', request)
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
    :title="purpose === 'resume' ? '恢复投稿' : '确定位置'"
    size="sm"
    :locked="submitting"
  >
    <template #content>
      <Stack gap="lg">
        <WorkbenchMangaProjectVerdict v-if="purpose !== 'resume'" :project="project" />
        <Form
          ref="form"
          :values="values"
          :rules="wholeVolume ? mangaVolumeInfoSchema : mangaChapterInfoSchema"
          :disabled="submitting"
          @submit="onSubmit"
        >
          <Stack gap="md">
            <FormField name="chapter_type" label="位置" required>
              <SegmentedControl v-model="values.chapter_type" :options="MANGA_PLACE_OPTIONS" />
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
            <ContributeMangaSetField v-model="setId" :sets="sets" />
            <FormField
              name="volume_id"
              :label="wholeVolume ? '卷' : '所属的卷'"
              :required="wholeVolume"
            >
              <Select
                v-model="values.volume_id"
                :options="choices"
                :loading="loading"
                :clearable="!wholeVolume"
                :placeholder="wholeVolume ? '选择卷' : '不属于任何一卷'"
              />
            </FormField>
            <FormField
              name="alternate"
              description="这一卷或这一话已有其他投稿的内容时，开启后两份内容并存，不替换已有内容。"
              description-placement="control"
            >
              <Switch v-model="alternate">与已有内容并存</Switch>
            </FormField>
          </Stack>
        </Form>
      </Stack>
    </template>

    <template #footer>
      <Button variant="ghost" tone="neutral" :disabled="submitting" @click="visible = false">
        取消
      </Button>
      <Button :loading="submitting" @click="form?.submit()">
        {{ purpose === 'approve' ? '保存并通过' : '保存并恢复' }}
      </Button>
    </template>
  </Dialog>
</template>
