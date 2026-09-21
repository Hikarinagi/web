<script setup lang="ts">
  import { IconButton } from '@hina-ui/vue'
  import { Highlighter, Underline } from '@lucide/vue'
  import { motion } from 'motion-v'
  import { EASE_CSS, TRANSITION } from '~/lib/motion'

  defineOptions({ name: 'HikariReaderAnnotationSelectionPopover' })

  const props = defineProps<{
    anchor: { x: number; y: number }
  }>()

  const emit = defineEmits<{
    highlight: []
    underline: []
  }>()

  const followTransition = `left 200ms ${EASE_CSS}, top 200ms ${EASE_CSS}`
</script>

<template>
  <motion.div
    data-reader-ui
    data-reader-selection-popover
    class="reader-selection-popover fixed z-30 inline-flex items-center gap-1 rounded-full p-1"
    :style="{
      left: `${props.anchor.x}px`,
      top: `${Math.max(68, props.anchor.y)}px`,
      translate: '-50% calc(-100% - 18px)',
      transformOrigin: '50% 100%',
      transition: followTransition,
    }"
    :initial="{ opacity: 0, scale: 0.96, y: 6 }"
    :animate="{ opacity: 1, scale: 1, y: 0 }"
    :exit="{ opacity: 0, scale: 0.96, y: 4 }"
    :transition="TRANSITION"
  >
    <IconButton
      label="高亮"
      :tooltip="false"
      variant="ghost"
      tone="neutral"
      size="sm"
      pill
      @click="emit('highlight')"
    >
      <Highlighter />
    </IconButton>
    <IconButton
      label="下划线"
      :tooltip="false"
      variant="ghost"
      tone="neutral"
      size="sm"
      pill
      @click="emit('underline')"
    >
      <Underline />
    </IconButton>
  </motion.div>
</template>

<style scoped>
  .reader-selection-popover {
    width: max-content;
    pointer-events: auto;
    background: var(--reader-bar-bg);
    border: 1px solid var(--reader-bar-border);
    box-shadow: var(--reader-bar-shadow);
    color: var(--reader-text);
    backdrop-filter: blur(18px) saturate(1.6);
  }

  .reader-selection-popover :deep(button) {
    color: var(--reader-icon);
    transition: background-color 140ms ease;
  }

  .reader-selection-popover :deep(button:not(:disabled):hover),
  .reader-selection-popover :deep(button:not(:disabled):focus-visible) {
    background: var(--reader-icon-hover-bg);
  }
</style>
