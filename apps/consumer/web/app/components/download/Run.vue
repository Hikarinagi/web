<script setup lang="ts">
  import type { HikariBizCode } from '@hikarinagi/shared'
  import { Inline, Progress, ScrollArea, Stack, Text } from '@hina-ui/vue'
  import type { RunSnapshot } from '~/features/download/engine/types'
  import { formatBytes, formatEta, formatSpeed } from '~/features/download/format'
  import { apiErrorMessage } from '~/utils/api/error'

  defineOptions({ name: 'DownloadRun' })

  const props = defineProps<{ run: RunSnapshot }>()
  const { t } = useLocaleText()

  const headline = computed(() => {
    switch (props.run.state) {
      case 'preparing':
        return t('download.run.preparing')
      case 'saving':
        return props.run.location
          ? t('download.run.savingTo', { location: props.run.location })
          : t('download.run.saving')
      case 'paused':
        return t('download.state.paused')
      case 'done':
        return t('download.run.saved')
      default:
        return t('download.run.interrupted')
    }
  })
  const failure = computed(() => {
    const error = props.run.error
    if (!error) return null
    if (error.fallback === 'status') return t('download.failure.status', { status: error.status })
    if (error.fallback) return t(`download.failure.${error.fallback}`)
    return apiErrorMessage({ code: error.code as HikariBizCode, message: error.message })
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
        return file.written
          ? `${Math.round((file.written / file.bytes) * 100)}%`
          : t('download.run.waiting')
      case 'saving':
        return `${file.bytes ? Math.round((file.written / file.bytes) * 100) : 0}%`
      case 'done':
        return t('download.run.saved')
      case 'error':
        return t('download.run.failed')
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
        <Text v-if="eta" size="sm" tone="muted">{{ t('download.run.remaining', { eta }) }}</Text>
      </Inline>
    </Inline>
    <Progress :value="percent" :aria-label="t('download.progress', { title: run.title })" />
    <Text v-if="failure" size="sm" tone="danger">{{ failure }}</Text>
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
