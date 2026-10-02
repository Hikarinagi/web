<script setup lang="ts">
  import { Alert, Button, Dialog, FileUpload, Progress, Stack, Text, toast } from '@hina-ui/vue'
  import { usePageUpload } from '~/features/workbench/manga/composables/usePageUpload'

  const props = defineProps<{ projectId: number }>()
  const visible = defineModel<boolean>('visible', { required: true })
  const emit = defineEmits<{ uploaded: [] }>()

  const files = ref<File[]>([])
  const { uploading, done, total, failed, upload } = usePageUpload(() => props.projectId)

  watch(visible, next => {
    if (next && !uploading.value) files.value = []
  })

  async function start() {
    if (!files.value.length) return
    const count = await upload(files.value)
    emit('uploaded')
    if (!failed.value.length) {
      toast.success(`已上传 ${count} 页`)
      visible.value = false
    }
  }
</script>

<template>
  <Dialog v-model:open="visible" title="上传页面" size="md" :locked="uploading">
    <template #content>
      <Stack gap="md">
        <FileUpload
          :model-value="files"
          multiple
          accept="image/*,.zip,.cbz,.epub"
          :disabled="uploading"
          aria-label="选择图片、压缩包或 EPUB"
          @update:model-value="
            value => (files = Array.isArray(value) ? value : value ? [value] : [])
          "
        />
        <Stack v-if="uploading || total" gap="xs">
          <Progress :value="total ? (done / total) * 100 : 0" />
          <Text size="xs" tone="muted">{{ done }} / {{ total }}</Text>
        </Stack>
        <Alert :open="failed.length > 0" tone="danger" :closable="false" title="以下图片上传失败">
          <Text size="sm">{{ failed.join('、') }}</Text>
        </Alert>
      </Stack>
    </template>

    <template #footer>
      <Button variant="ghost" tone="neutral" :disabled="uploading" @click="visible = false">
        关闭
      </Button>
      <Button :loading="uploading" :disabled="!files.length" @click="start">开始上传</Button>
    </template>
  </Dialog>
</template>
