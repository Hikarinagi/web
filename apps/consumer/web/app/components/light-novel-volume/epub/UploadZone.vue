<script setup lang="ts">
  import { Upload } from '@lucide/vue'

  defineOptions({ name: 'LightNovelVolumeEpubUploadZone' })
  withDefaults(defineProps<{ file: File | null; label?: string; hint?: string }>(), {
    label: '选择 EPUB 文件',
    hint: undefined,
  })
  const emit = defineEmits<{ pick: [] }>()
</script>

<template>
  <Button
    unstyled
    type="button"
    class="flex w-full items-center gap-3 rounded-lg border border-dashed border-surface p-4 text-left transition-colors hover:border-primary"
    @click="emit('pick')"
  >
    <span class="flex size-10 shrink-0 items-center justify-center rounded-full bg-emphasis">
      <Upload class="size-5" aria-hidden="true" />
    </span>
    <span class="flex min-w-0 flex-col">
      <span class="truncate text-sm font-medium text-color">{{ file ? file.name : label }}</span>
      <span v-if="file || hint" class="truncate text-xs text-muted-color">
        {{ file ? '点此重新选择' : hint }}
      </span>
    </span>
  </Button>
</template>
