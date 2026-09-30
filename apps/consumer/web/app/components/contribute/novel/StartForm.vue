<script setup lang="ts">
  import { Combobox, Form, FormField, FormLayout, Select } from '@hina-ui/vue'
  import { useVolumeSearch } from '~/features/contribute/useVolumeSearch'
  import { volumeLabel } from '~/features/contribute/wanted'
  import { LANGUAGE_OPTIONS } from '~/features/galgame/labels'
  import {
    createProjectSchema,
    type CreateProjectValues,
  } from '~/features/workbench/schemas/workbench.schema'
  import { getFieldErrors } from '~/utils/api/error'

  const props = defineProps<{ volumeId?: number; mode: 'ENTRY' | 'TRANSLATION' }>()

  const CHINESE_OPTIONS = LANGUAGE_OPTIONS.filter(option => option.value.startsWith('zh'))

  const { requireLogin } = useAuthGate()
  const { search, results, loading } = useVolumeSearch()
  const form = useTemplateRef<InstanceType<typeof Form>>('form')
  const submitting = ref(false)
  const picked = shallowRef<{ value: number; label: string } | null>(null)
  const target = computed(() => props.volumeId ?? picked.value?.value ?? null)
  const translation = computed(() => props.mode === 'TRANSLATION')
  const options = computed(() =>
    results.value.map(volume => {
      const label = `${volume.series.name_cn || volume.series.name} ${volumeLabel(volume)}`
      return {
        value: volume.id,
        label: volume.has_epub ? `${label}（本站已收录）` : label,
        disabled: volume.has_epub,
      }
    }),
  )
  const values = reactive<CreateProjectValues>({
    mode: props.mode,
    source_lang: translation.value ? 'ja' : 'zh-Hans',
    target_lang: 'zh-Hans',
  })

  watch(
    () => props.mode,
    mode => {
      values.mode = mode
      values.source_lang = mode === 'TRANSLATION' ? 'ja' : 'zh-Hans'
    },
  )

  function pick(value: string | number | null | undefined) {
    picked.value = options.value.find(option => option.value === value) ?? null
    search.value = ''
  }

  function reset() {
    form.value?.reset()
    picked.value = null
    values.mode = props.mode
    values.source_lang = translation.value ? 'ja' : 'zh-Hans'
    values.target_lang = 'zh-Hans'
  }

  async function onSubmit() {
    if (submitting.value || !target.value || !requireLogin()) return
    submitting.value = true
    try {
      const project = await hikariRequest('/api/v3/novel-projects', {
        method: 'post',
        body: {
          light_novel_volume_id: target.value,
          mode: props.mode,
          source_lang: values.source_lang as 'ja',
          target_lang: translation.value ? (values.target_lang as 'zh-Hans') : undefined,
        },
      })
      await navigateTo(`/create/projects/${project.id}`)
    } catch (error) {
      form.value?.setErrors(getFieldErrors(error))
    } finally {
      submitting.value = false
    }
  }

  defineExpose({
    submit: () => form.value?.submit(),
    reset,
    submitting,
    ready: computed(() => !!target.value),
  })
</script>

<template>
  <Form
    ref="form"
    :values="values"
    :rules="createProjectSchema"
    :disabled="submitting"
    @submit="onSubmit"
  >
    <FormLayout>
      <FormField v-if="volumeId === undefined" name="volume" label="分卷" required>
        <Combobox
          v-model:search="search"
          :model-value="picked?.value ?? null"
          :selected-option="picked ?? undefined"
          :options="options"
          :loading="loading"
          ignore-filter
          placeholder="搜索书名，或输入卷、系列 ID"
          @update:model-value="pick"
        />
      </FormField>
      <FormLayout :columns="translation ? 2 : 1">
        <FormField name="source_lang" :label="translation ? '原文语言' : '语言'" required>
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
