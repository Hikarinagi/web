<script setup lang="ts">
  import { ImagePlus } from '@lucide/vue'

  defineProps<{ uploading?: boolean }>()
  const emit = defineEmits<{ files: [files: File[]] }>()

  const input = ref<HTMLInputElement>()

  function pick() {
    input.value?.click()
  }
  function onChange(event: Event) {
    const target = event.target as HTMLInputElement
    const files = Array.from(target.files ?? [])
    if (files.length) emit('files', files)
    target.value = ''
  }
</script>

<template>
  <div class="aspect-square w-full">
    <Button
      :loading="uploading"
      variant="outlined"
      severity="secondary"
      icon-pos="top"
      :label="uploading ? '上传中' : '点击或拖拽上传'"
      size="small"
      class="size-full!"
      login-required
      @click="pick"
    >
      <template #icon>
        <ImagePlus class="size-6" />
      </template>
    </Button>
    <input
      ref="input"
      type="file"
      accept="image/jpeg,image/png,image/webp,image/gif"
      multiple
      class="hidden"
      @change="onChange"
    />
  </div>
</template>
