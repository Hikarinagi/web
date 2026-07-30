<script setup lang="ts">
  import { Download, Link2 } from '@lucide/vue'
  import { fileSizeLabel, type GalgameDownloadResource } from '~/features/galgame/download'

  defineOptions({ name: 'GalgameDownloadsFileItem' })
  const props = defineProps<{
    file: GalgameDownloadResource['files'][number]
    pendingFileId: number | null
  }>()
  defineEmits<{ download: [number]; copy: [number] }>()

  const loading = computed(() => props.pendingFileId === props.file.id)
</script>

<template>
  <div
    class="flex flex-col gap-3 rounded-xl border border-surface p-4 sm:flex-row sm:items-center sm:justify-between"
  >
    <div class="flex min-w-0 flex-col gap-1">
      <p class="truncate text-sm font-medium text-color" :title="file.file_name">
        {{ file.file_name }}
      </p>
      <p class="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-color">
        <span>{{ fileSizeLabel(file.file_size) }}</span>
        <span v-if="file.file_hash" class="truncate font-mono">
          {{ file.hash_algorithm ?? 'hash' }}: {{ file.file_hash }}
        </span>
      </p>
    </div>

    <div class="flex shrink-0 items-stretch gap-2">
      <Button label="下载" login-required :loading="loading" @click="$emit('download', file.id)">
        <template #icon><Download class="size-4" /></template>
      </Button>
      <Button
        v-tooltip.top="'复制下载链接'"
        severity="secondary"
        outlined
        login-required
        :loading="loading"
        aria-label="复制下载链接"
        @click="$emit('copy', file.id)"
      >
        <template #icon><Link2 class="size-4" /></template>
      </Button>
    </div>
  </div>
</template>
