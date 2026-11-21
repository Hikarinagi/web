<script setup lang="ts">
  import { FileUpload } from '@hina-ui/vue'
  import { ImagePlus } from '@lucide/vue'
  import { IMAGE_TYPES } from './lib/upload'

  defineProps<{ uploading?: boolean }>()
  const emit = defineEmits<{ files: [files: File[]] }>()

  function onPicked(value: File | File[] | null) {
    const files = Array.isArray(value) ? value : value ? [value] : []
    if (files.length) emit('files', files)
  }
</script>

<template>
  <FileUpload
    :model-value="null"
    multiple
    :list="false"
    :loading="uploading"
    :accept="IMAGE_TYPES.join(',')"
    class="aspect-square"
    @drop.stop
    @update:model-value="onPicked"
  >
    <template #icon><ImagePlus /></template>
    {{ uploading ? '上传中' : '点击或拖拽上传' }}
  </FileUpload>
</template>
