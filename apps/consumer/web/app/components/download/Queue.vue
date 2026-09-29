<script setup lang="ts">
  import { Inline, Progress, Stack, Text } from '@hina-ui/vue'
  import type { DownloadPart } from '~/features/download/types'

  const props = defineProps<{ parts: DownloadPart[]; completed: number; busy: boolean }>()
  const current = computed(() => props.parts[props.completed])
</script>

<template>
  <Stack gap="lg" aria-live="polite">
    <Stack gap="sm">
      <Inline justify="between">
        <Text>{{ current ? (busy ? '正在下载' : '已暂停') : '下载完成' }}</Text>
        <Text size="sm" tone="muted">{{ completed }} / {{ parts.length }} 个文件</Text>
      </Inline>
      <Progress :value="completed" :max="parts.length" aria-label="下载进度" />
    </Stack>
    <Stack v-if="current" gap="xs">
      <Text size="sm" class="break-words">{{ current.file_name }}</Text>
      <Text v-if="'byte_size' in current" size="sm" tone="muted"
        >{{ (current.byte_size / 1024 / 1024).toFixed(1) }} MB</Text
      >
    </Stack>
    <Text v-if="parts.length > 1 && current" size="sm" tone="muted"
      >浏览器询问时，请允许下载多个文件。</Text
    >
  </Stack>
</template>
