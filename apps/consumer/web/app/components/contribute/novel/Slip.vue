<script setup lang="ts">
  import { Button, FormField, FormLayout, SegmentedControl } from '@hina-ui/vue'
  import type { useNovelIntake } from '~/features/contribute/useNovelIntake'
  import NovelUpload from '../upload/Novel.vue'
  import StartForm from './StartForm.vue'

  defineProps<{ intake: ReturnType<typeof useNovelIntake>; dragging: boolean }>()

  const MODE_OPTIONS = [
    { value: 'EPUB', label: '上传 EPUB' },
    { value: 'ENTRY', label: '录入' },
    { value: 'TRANSLATION', label: '翻译' },
  ]

  const mode = ref<'EPUB' | 'ENTRY' | 'TRANSLATION'>('EPUB')
  const upload = useTemplateRef<InstanceType<typeof NovelUpload>>('upload')
  const form = useTemplateRef<InstanceType<typeof StartForm>>('form')

  async function receive(files: File[]) {
    mode.value = 'EPUB'
    const target = await until(upload).toBeTruthy({ timeout: 2000 })
    target?.receive(files)
  }

  defineExpose({ receive })
</script>

<template>
  <FormLayout>
    <FormField label="类型" required>
      <SegmentedControl v-model="mode" :options="MODE_OPTIONS" />
    </FormField>
    <NovelUpload v-if="mode === 'EPUB'" ref="upload" :intake="intake" :dragging="dragging" />
    <StartForm v-else ref="form" :mode="mode" />
    <Button
      v-if="mode !== 'EPUB'"
      :loading="form?.submitting"
      :disabled="!form?.ready"
      @click="form?.submit()"
    >
      开始
    </Button>
  </FormLayout>
</template>
