<script setup lang="ts">
  import { CloseButton, Inline, ScrollArea, Text } from '@hina-ui/vue'
  import { NotebookPen } from '@lucide/vue'
  import { motion } from 'motion-v'
  import type { ReaderFootnote } from './composables/useReaderFootnotes'

  defineOptions({ name: 'HikariReaderFootnotePanel' })

  defineProps<{
    footnote: ReaderFootnote
  }>()

  const emit = defineEmits<{
    dismiss: []
  }>()

  function labelFor(kind: ReaderFootnote['kind']) {
    if (kind === 'endnote') return '尾注'
    if (kind === 'rearnote') return '后注'
    return '脚注'
  }
</script>

<template>
  <motion.aside
    data-reader-ui
    data-reader-footnote-panel
    role="note"
    class="reader-footnote-panel fixed inset-x-3 z-30 mx-auto max-w-2xl rounded-xl p-4"
    :initial="{ opacity: 0, scale: 0.96, y: 10 }"
    :animate="{ opacity: 1, scale: 1, y: 0 }"
    :exit="{ opacity: 0, scale: 0.96, y: 8 }"
    :aria-label="labelFor(footnote.kind)"
  >
    <Inline as="header" gap="sm" align="center" :wrap="false" class="reader-footnote-header">
      <NotebookPen class="size-4 shrink-0" />
      <Text as="span" size="xs" weight="medium" truncate class="min-w-0 flex-1 tracking-wide">
        {{ labelFor(footnote.kind) }}
      </Text>
      <CloseButton
        label="关闭脚注"
        :tooltip="false"
        size="sm"
        class="reader-footnote-close shrink-0"
        @click="emit('dismiss')"
      />
    </Inline>

    <ScrollArea class="reader-footnote-scroll mt-2">
      <Text size="sm" class="reader-footnote-content leading-7">
        {{ footnote.text || '无内容' }}
      </Text>
    </ScrollArea>
  </motion.aside>
</template>

<style scoped>
  .reader-footnote-panel {
    bottom: calc(max(env(safe-area-inset-bottom), 0.75rem) + 4.25rem);
    pointer-events: auto;
    background: var(--reader-bar-bg);
    border: 1px solid var(--reader-bar-border);
    box-shadow: var(--reader-bar-shadow);
    color: var(--reader-text);
    backdrop-filter: blur(18px) saturate(1.6);
  }

  .reader-footnote-header {
    color: var(--reader-text-muted);
  }

  .reader-footnote-scroll {
    max-height: min(45dvh, 18rem);
  }

  .reader-footnote-content {
    color: var(--reader-text);
    white-space: pre-wrap;
  }

  .reader-footnote-close {
    color: var(--reader-icon);
    transition: background-color 140ms ease;
  }

  .reader-footnote-close:not(:disabled):hover,
  .reader-footnote-close:not(:disabled):focus-visible {
    background: var(--reader-icon-hover-bg);
  }

  @media (max-width: 640px) {
    .reader-footnote-panel {
      bottom: max(env(safe-area-inset-bottom), 0.75rem);
    }
  }
</style>
