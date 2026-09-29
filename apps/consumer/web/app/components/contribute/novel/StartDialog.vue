<script setup lang="ts">
  import { Button, Dialog, Form, FormField, Select, Stack, Text } from '@hina-ui/vue'
  import { LANGUAGE_OPTIONS } from '~/features/galgame/labels'
  import type { NovelTargetVolume } from '~/features/contribute/novel-target'
  import {
    createProjectSchema,
    type CreateProjectValues,
  } from '~/features/workbench/schemas/workbench.schema'
  import { getFieldErrors } from '~/utils/api/error'

  const props = defineProps<{ volume: NovelTargetVolume; mode: 'ENTRY' | 'TRANSLATION' }>()
  const open = defineModel<boolean>('open', { required: true })

  const RULE = {
    TRANSLATION:
      '每卷每种语言只能有一个正在进行的翻译。长时间没有活动的翻译被释放，以便其他人可以开始新的翻译。',
    ENTRY: '每卷只能有一个正在进行的录入。长时间没有活动的录入被释放，以便其他人可以开始新的录入。',
  }

  const form = useTemplateRef<InstanceType<typeof Form>>('form')
  const submitting = ref(false)
  const values = reactive<CreateProjectValues>({
    mode: props.mode,
    source_lang: 'ja',
    target_lang: 'zh-Hans',
  })
  const translation = computed(() => values.mode === 'TRANSLATION')

  watch(open, next => {
    if (!next) return
    form.value?.reset()
    values.mode = props.mode
    values.source_lang = props.mode === 'TRANSLATION' ? 'ja' : 'zh-Hans'
    values.target_lang = 'zh-Hans'
  })

  async function onSubmit() {
    if (submitting.value) return
    submitting.value = true
    try {
      const project = await hikariRequest('/api/v3/novel-projects', {
        method: 'post',
        body: {
          light_novel_volume_id: props.volume.id,
          mode: values.mode,
          source_lang: values.source_lang as 'ja',
          target_lang: translation.value ? (values.target_lang as 'zh-Hans') : undefined,
        },
      })
      open.value = false
      await navigateTo(`/create/projects/${project.id}`)
    } catch (error) {
      form.value?.setErrors(getFieldErrors(error))
    } finally {
      submitting.value = false
    }
  }
</script>

<template>
  <Dialog
    v-model:open="open"
    :title="translation ? '翻译该卷' : '录入该卷'"
    size="sm"
    :locked="submitting"
  >
    <template #content>
      <Stack gap="lg">
        <ContributeVolumeHead :volume="volume" large />
        <Form
          ref="form"
          :values="values"
          :rules="createProjectSchema"
          :disabled="submitting"
          @submit="onSubmit"
        >
          <Stack gap="md">
            <FormField name="source_lang" :label="translation ? '原文语言' : '语言'" required>
              <Select v-model="values.source_lang" :options="LANGUAGE_OPTIONS" />
            </FormField>
            <FormField v-if="translation" name="target_lang" label="译文语言" required>
              <Select v-model="values.target_lang" :options="LANGUAGE_OPTIONS" />
            </FormField>
          </Stack>
        </Form>
        <Text size="sm" tone="muted">{{ RULE[values.mode] }}</Text>
      </Stack>
    </template>
    <template #footer>
      <Button variant="ghost" tone="neutral" :disabled="submitting" @click="open = false">
        取消
      </Button>
      <Button :loading="submitting" @click="form?.submit()">开始</Button>
    </template>
  </Dialog>
</template>
