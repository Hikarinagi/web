<script setup lang="ts">
  import {
    Combobox,
    Form,
    FormField,
    FormLayout,
    Input,
    SegmentedControl,
    Select,
  } from '@hina-ui/vue'
  import type { MangaTarget } from '~/features/contribute/manga-target'
  import {
    chapterOptions,
    firstFree,
    NEW_TARGET,
    volumeOptions,
  } from '~/features/contribute/manga-options'
  import { useMangaSearch } from '~/features/contribute/useMangaSearch'
  import { useMangaTargets } from '~/features/contribute/useMangaTargets'
  import { LANGUAGE_OPTIONS } from '~/features/galgame/labels'
  import { MANGA_CHAPTER_TYPE_OPTIONS } from '~/features/workbench/labels'
  import {
    createMangaProjectSchema,
    type CreateMangaProjectValues,
  } from '~/features/workbench/manga/schemas/manga.schema'
  import { getFieldErrors } from '~/utils/api/error'

  const props = defineProps<{
    series: MangaTarget | null
    chapterId?: number | null
    volumeId?: number | null
    mode?: 'UPLOAD' | 'TRANSLATION'
    scope?: 'CHAPTER' | 'VOLUME'
    lockSeries?: boolean
    newChapter?: string
  }>()

  const MODE_OPTIONS = [
    { value: 'UPLOAD', label: '上传' },
    { value: 'TRANSLATION', label: '翻译' },
  ]
  const SCOPE_OPTIONS = [
    { value: 'CHAPTER', label: '一话' },
    { value: 'VOLUME', label: '整卷' },
  ]
  const CHINESE_OPTIONS = LANGUAGE_OPTIONS.filter(option => option.value.startsWith('zh'))

  const { requireLogin } = useAuthGate()
  const createOpen = ref(false)
  const created = ref<{
    id: number
    label: string
    change_request_id: number
    pending: boolean
  } | null>(null)
  const form = useTemplateRef<InstanceType<typeof Form>>('form')
  const submitting = ref(false)
  const target = shallowRef<MangaTarget | null>(props.series)
  const fixed = computed(() => props.chapterId != null || props.volumeId != null)
  const { search, results, loading: searching } = useMangaSearch()
  const { chapters, volumes, claims } = useMangaTargets(() =>
    fixed.value ? null : (target.value?.id ?? null),
  )
  const values = reactive<CreateMangaProjectValues>({
    mode: props.mode ?? 'UPLOAD',
    scope: props.volumeId != null ? 'VOLUME' : (props.scope ?? 'CHAPTER'),
    chapter_id: props.chapterId ?? null,
    chapter_type: 'SERIALIZATION',
    chapter_number: props.newChapter ?? '',
    chapter_name: '',
    volume_id: props.volumeId ?? null,
    source_lang: 'zh-Hans',
    target_lang: 'zh-Hans',
  })
  const translation = computed(() => values.mode === 'TRANSLATION')
  const wholeVolume = computed(() => values.scope === 'VOLUME')
  const mangaOptions = computed(() =>
    results.value.map(item => ({ value: item.id, label: item.name_cn || item.name })),
  )
  const chapterChoices = computed(() => chapterOptions(chapters.value, claims.value))
  const volumeChoices = computed(() => {
    const options = volumeOptions(volumes.value, chapters.value, claims.value)
    if (created.value && !options.some(option => option.value === created.value!.id)) {
      options.splice(options.length - 1, 0, { value: created.value.id, label: created.value.label })
    }
    return options
  })
  const nextVolumeNumber = computed(() => {
    const numbers = volumes.value
      .map(volume => volume.volume_number)
      .filter((value): value is number => value != null)
    return numbers.length ? Math.max(...numbers) + 1 : 1
  })
  const chapter = computed({
    get: () => values.chapter_id ?? NEW_TARGET,
    set: value => {
      values.chapter_id = value === NEW_TARGET ? null : Number(value)
    },
  })
  const volume = computed<number | string | null>({
    get: () => values.volume_id ?? null,
    set: value => {
      if (value === NEW_TARGET) createOpen.value = true
      else values.volume_id = value == null ? null : Number(value)
    },
  })

  function onCreated(volume: {
    id: number
    label: string
    change_request_id: number
    pending: boolean
  }) {
    created.value = volume
    values.volume_id = volume.id
  }

  function onPicked(volumeId: number) {
    if (volumes.value.some(volume => volume.id === volumeId)) values.volume_id = volumeId
  }

  watch(
    () => values.mode,
    mode => {
      values.source_lang = mode === 'TRANSLATION' ? 'ja' : 'zh-Hans'
    },
    { immediate: true },
  )
  watch(chapterChoices, options => {
    if (!fixed.value && props.newChapter == null) values.chapter_id = firstFree(options)
  })
  watch(volumeChoices, options => {
    if (!fixed.value) values.volume_id = firstFree(options)
  })

  function pick(value: string | number | null | undefined) {
    const found = results.value.find(item => item.id === value)
    if (found) target.value = { id: found.id, title: found.name_cn || found.name }
    search.value = ''
  }

  async function onSubmit() {
    if (submitting.value || !target.value || !requireLogin()) return
    submitting.value = true
    try {
      const project = await hikariRequest('/api/v3/manga-projects', {
        method: 'post',
        body: {
          series_id: target.value.id,
          mode: values.mode,
          scope: values.scope,
          ...(wholeVolume.value
            ? {
                volume_id: values.volume_id ?? undefined,
                volume_change_request_id:
                  created.value?.pending && created.value.id === values.volume_id
                    ? created.value.change_request_id
                    : undefined,
              }
            : {
                chapter_id: values.chapter_id ?? undefined,
                chapter_type: values.chapter_id ? undefined : values.chapter_type,
                chapter_number: values.chapter_id
                  ? undefined
                  : values.chapter_number?.trim() || null,
                chapter_name: values.chapter_id ? undefined : values.chapter_name?.trim() || null,
              }),
          source_lang: values.source_lang as 'ja',
          target_lang: translation.value ? (values.target_lang as 'zh-Hans') : undefined,
        },
      })
      await navigateTo(`/create/manga/${project.id}`)
    } catch (error) {
      form.value?.setErrors(getFieldErrors(error))
    } finally {
      submitting.value = false
    }
  }

  defineExpose({
    submit: () => form.value?.submit(),
    submitting,
    ready: computed(() => !!target.value),
  })
</script>

<template>
  <Form
    ref="form"
    :values="values"
    :rules="createMangaProjectSchema"
    :disabled="submitting"
    @submit="onSubmit"
  >
    <FormLayout>
      <FormField name="mode" label="类型" required>
        <SegmentedControl v-model="values.mode" :options="MODE_OPTIONS" />
      </FormField>
      <FormField v-if="!lockSeries" name="series" label="漫画" required>
        <Combobox
          v-model:search="search"
          :model-value="target?.id ?? null"
          :selected-option="target ? { value: target.id, label: target.title } : undefined"
          :options="mangaOptions"
          :loading="searching"
          ignore-filter
          placeholder="搜索漫画"
          @update:model-value="pick"
        />
      </FormField>
      <FormField v-if="!fixed && target" name="scope" label="范围" required>
        <SegmentedControl v-model="values.scope" :options="SCOPE_OPTIONS" />
      </FormField>
      <template v-if="wholeVolume">
        <FormField v-if="!fixed && target" name="volume_id" label="单行本" required>
          <Select v-model="volume" :options="volumeChoices" placeholder="选择单行本" />
        </FormField>
        <ContributeMangaVolumeCreateDialog
          v-if="target"
          v-model:open="createOpen"
          :series="target"
          :volume-number="nextVolumeNumber"
          @created="onCreated"
          @picked="onPicked"
        />
      </template>
      <template v-else>
        <FormField v-if="!fixed && target" name="chapter_id" label="章节" required>
          <Select v-model="chapter" :options="chapterChoices" />
        </FormField>
        <FormField
          v-if="!fixed && target && values.chapter_id === null"
          name="chapter_type"
          label="类型"
          required
        >
          <SegmentedControl v-model="values.chapter_type" :options="MANGA_CHAPTER_TYPE_OPTIONS" />
        </FormField>
        <FormLayout v-if="!fixed && target && values.chapter_id === null" :columns="2">
          <FormField
            name="chapter_number"
            label="话数"
            :required="values.chapter_type === 'SERIALIZATION'"
          >
            <Input v-model="values.chapter_number" placeholder="12" />
          </FormField>
          <FormField
            name="chapter_name"
            label="标题"
            :required="values.chapter_type !== 'SERIALIZATION'"
          >
            <Input v-model="values.chapter_name" />
          </FormField>
        </FormLayout>
      </template>
      <FormLayout :columns="translation ? 2 : 1">
        <FormField name="source_lang" :label="translation ? '原文语言' : '图源语言'" required>
          <Select
            v-model="values.source_lang"
            :options="translation ? LANGUAGE_OPTIONS : CHINESE_OPTIONS"
          />
        </FormField>
        <FormField v-if="translation" name="target_lang" label="译文语言" required>
          <Select v-model="values.target_lang" :options="CHINESE_OPTIONS" />
        </FormField>
      </FormLayout>
    </FormLayout>
  </Form>
</template>
