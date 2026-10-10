<script setup lang="ts">
  import { Inline, Progress, ScrollArea, Stack, Text } from '@hina-ui/vue'
  import type { RunSnapshot } from '~/features/download/engine/types'
  import { formatBytes, formatEta, formatSpeed } from '~/features/download/format'

  defineOptions({ name: 'DownloadRun' })

  const props = defineProps<{ run: RunSnapshot }>()

  const headline = computed(() => {
    switch (props.run.state) {
      case 'preparing':
        return '正在准备'
      case 'saving':
        return props.run.location ? `正在保存到「${props.run.location}」` : '正在保存'
      case 'paused':
        return '已暂停'
      case 'done':
        return '已保存'
      default:
        return '保存已中断'
    }
  })
  const percent = computed(() =>
    props.run.total ? Math.min(100, Math.round((props.run.written / props.run.total) * 100)) : 0,
  )
  const eta = computed(() =>
    props.run.state === 'saving'
      ? formatEta(props.run.total - props.run.written, props.run.speed)
      : null,
  )

  function label(file: RunSnapshot['files'][number]) {
    switch (file.state) {
      case 'waiting':
        return file.written ? `${Math.round((file.written / file.bytes) * 100)}%` : '等待'
      case 'saving':
        return `${file.bytes ? Math.round((file.written / file.bytes) * 100) : 0}%`
      case 'done':
        return '已保存'
      case 'error':
        return '出错'
    }
  }
</script>

<template>
  <Stack gap="md" aria-live="polite">
    <Inline justify="between" align="center" gap="md" :wrap="false">
      <Text weight="medium" truncate>{{ headline }}</Text>
      <Inline gap="md" align="center" :wrap="false" class="shrink-0 tabular-nums">
        <Text size="sm" tone="muted">
          {{ formatBytes(run.written) }} / {{ formatBytes(run.total) }}
        </Text>
        <Text v-if="run.state === 'saving'" size="sm" tone="muted">
          {{ formatSpeed(run.speed) }}
        </Text>
        <Text v-if="eta" size="sm" tone="muted">剩余{{ eta }}</Text>
      </Inline>
    </Inline>
    <Progress :value="percent" :aria-label="`${run.title} 的保存进度`" />
    <Text v-if="run.error" size="sm" tone="danger">{{ run.error.message }}</Text>
    <ScrollArea v-if="run.files.length > 1" class="max-h-48">
      <Stack gap="xs">
        <Inline
          v-for="file in run.files"
          :key="file.index"
          justify="between"
          align="center"
          gap="md"
          :wrap="false"
        >
          <Text size="sm" truncate class="min-w-0">{{ file.name }}</Text>
          <Text size="sm" tone="muted" class="shrink-0 tabular-nums">{{ label(file) }}</Text>
        </Inline>
      </Stack>
    </ScrollArea>
    <Text v-else size="sm" tone="muted" truncate>{{ run.files[0]?.name }}</Text>
  </Stack>
</template>
