<script setup lang="ts">
  import { Button, DisclosureIcon, Inline, Popover, Progress, ScrollArea, Text } from '@hina-ui/vue'
  import { useReader } from '~/features/light-novel-reader/context'
  import { cn } from '~/utils/cn'

  defineOptions({ name: 'LightNovelReaderDesktopStatusBar' })

  const { location, settings, shell, engine } = useReader()
  const { title, current, chapter, book, laid, position, minutesLeft } = location
  const { quickToc } = shell
  const { phase } = engine

  const label = computed(() => title.value || current.value?.label || '目录')

  const now = useNow({ interval: 30_000 })
  const clock = computed(() =>
    now.value.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false }),
  )

  const pages = computed(() => {
    const span = chapter.value
    if (!span) return ''
    const shown = span.from === span.to ? `${span.from}` : `${span.from}–${span.to}`
    return `本章 ${shown} / ${span.total} 页`
  })
  const percent = computed(() =>
    laid.value && position.value ? Math.floor(position.value.progress * 100) : null,
  )
  const bookPages = computed(() => {
    const span = book.value
    if (!span) return ''
    const shown = span.from === span.to ? `${span.from}` : `${span.from}–${span.to}`
    return `${shown} / ${span.total} 页`
  })
</script>

<template>
  <Inline
    as="footer"
    :wrap="false"
    align="center"
    gap="lg"
    data-tour="progress"
    class="h-9 shrink-0 border-t border-line bg-surface px-5"
  >
    <Popover
      v-model:open="quickToc"
      side="top"
      align="start"
      :padded="false"
      aria-label="目录"
      class="w-80"
      @close-auto-focus.prevent
    >
      <Button
        variant="ghost"
        tone="neutral"
        size="xs"
        :disabled="phase !== 'ready'"
        class="-ms-2 max-w-full min-w-0 shrink"
      >
        <Text as="span" size="xs" weight="medium" truncate>{{ label }}</Text>
        <template #trailing><DisclosureIcon /></template>
      </Button>
      <template #content>
        <ScrollArea class="max-h-96">
          <LightNovelReaderTocPanel block="center" />
        </ScrollArea>
      </template>
    </Popover>
    <Text size="xs" tone="muted" class="min-w-32 shrink-0 tabular-nums">{{ pages }}</Text>
    <Progress
      v-if="percent != null"
      :value="percent"
      size="sm"
      aria-label="全书阅读进度"
      class="max-w-64 min-w-16 flex-1"
    />
    <Text size="xs" tone="muted" class="min-w-16 shrink-0 tabular-nums">
      {{ bookPages }}
    </Text>
    <Text v-if="minutesLeft" size="xs" tone="muted" class="ml-auto shrink-0 tabular-nums">
      本章剩余约 {{ minutesLeft }} 分钟
    </Text>
    <Text
      v-if="settings.device.value.showTime"
      size="xs"
      tone="muted"
      :class="cn('shrink-0 tabular-nums', !minutesLeft && 'ml-auto')"
    >
      {{ clock }}
    </Text>
  </Inline>
</template>
