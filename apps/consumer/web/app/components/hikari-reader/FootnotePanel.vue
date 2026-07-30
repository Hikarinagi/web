<script setup lang="ts">
  import { X, NotebookPen } from '@lucide/vue'
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
    class="reader-footnote-panel fixed left-1/2 z-30 w-[calc(100vw-1.5rem)] max-w-2xl rounded-xl p-4"
    :style="{ translate: '-50% 0' }"
    :initial="{ opacity: 0, scale: 0.96, y: 10 }"
    :animate="{ opacity: 1, scale: 1, y: 0 }"
    :exit="{ opacity: 0, scale: 0.96, y: 8 }"
    :aria-label="labelFor(footnote.kind)"
  >
    <header class="flex items-center gap-3">
      <NotebookPen class="size-4" />
      <span class="min-w-0 flex-1 text-xs font-medium tracking-wide">
        {{ labelFor(footnote.kind) }}
      </span>
      <Button
        rounded
        severity="secondary"
        variant="text"
        size="small"
        aria-label="关闭脚注"
        class="reader-footnote-close shrink-0"
        @click="emit('dismiss')"
      >
        <template #icon>
          <X :size="14" aria-hidden="true" />
        </template>
      </Button>
    </header>

    <p
      class="reader-footnote-content mt-2 max-h-[min(45dvh,18rem)] overflow-y-auto text-sm leading-7"
    >
      {{ footnote.text || '无内容' }}
    </p>
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
    -webkit-backdrop-filter: blur(18px) saturate(1.6);
  }

  .reader-footnote-panel header {
    color: var(--reader-text-muted);
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
