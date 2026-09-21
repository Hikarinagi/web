<script setup lang="ts">
  import { Divider, IconButton, Inline, Text } from '@hina-ui/vue'
  import { NotebookPen, Trash2 } from '@lucide/vue'
  import { motion } from 'motion-v'
  import { computed } from 'vue'
  import type { ReaderAnnotation } from '../composables/useReaderAnnotations'
  import { useFloatingPopover } from '../composables/useFloatingPopover'

  defineOptions({ name: 'HikariReaderAnnotationActionPopover' })

  const props = defineProps<{
    annotation: ReaderAnnotation
    anchor: { x: number; y: number }
  }>()

  const emit = defineEmits<{
    changeColor: [color: string]
    editNote: []
    remove: []
  }>()

  const anchorRef = computed(() => props.anchor)
  const floating = useFloatingPopover({
    anchor: anchorRef,
    fallbackSize: { width: 288, height: 160 },
    gap: 12,
    margin: 12,
  })
  const popoverStyle = computed(() => floating.style.value)
  const enterY = computed(() => (floating.placement.value === 'below' ? -6 : 6))
  const exitY = computed(() => (floating.placement.value === 'below' ? -4 : 4))
</script>

<template>
  <motion.div
    :ref="floating.target"
    data-reader-ui
    data-reader-action-popover
    class="reader-action-popover fixed z-30 flex flex-col gap-2 rounded-lg p-2"
    :style="popoverStyle"
    :initial="{ opacity: 0, scale: 0.7, y: enterY }"
    :animate="{ opacity: 1, scale: 1, y: 0 }"
    :exit="{ opacity: 0, scale: 0.85, y: exitY }"
  >
    <Inline justify="between" align="center" gap="xs" :wrap="false" class="px-1">
      <HikariReaderAnnotationColorPicker
        size="sm"
        :model-value="annotation.color"
        @update:model-value="emit('changeColor', $event)"
      />
    </Inline>

    <Text
      v-if="annotation.note"
      size="xs"
      class="line-clamp-3 px-1 leading-5 text-(--reader-text-muted)"
    >
      {{ annotation.note }}
    </Text>

    <Divider decorative class="-mx-0.5 w-auto bg-(--reader-bar-border)" />

    <Inline justify="end" align="center" gap="xs" :wrap="false">
      <IconButton
        :label="annotation.note ? '编辑笔记' : '添加标注'"
        :tooltip="false"
        variant="ghost"
        tone="neutral"
        size="sm"
        pill
        class="text-(--reader-icon)"
        @click="emit('editNote')"
      >
        <NotebookPen />
      </IconButton>
      <IconButton
        label="删除标注"
        :tooltip="false"
        variant="ghost"
        tone="danger"
        size="sm"
        pill
        @click="emit('remove')"
      >
        <Trash2 />
      </IconButton>
    </Inline>
  </motion.div>
</template>

<style scoped>
  .reader-action-popover {
    width: min(calc(100vw - 2rem), 18rem);
    pointer-events: auto;
    background: var(--reader-bar-bg);
    border: 1px solid var(--reader-bar-border);
    box-shadow: var(--reader-bar-shadow);
    color: var(--reader-text);
    backdrop-filter: blur(18px) saturate(1.6);
  }

  .reader-action-popover :deep(button) {
    transition: background-color 140ms ease;
  }

  .reader-action-popover :deep(button:not(:disabled):hover),
  .reader-action-popover :deep(button:not(:disabled):focus-visible) {
    background: var(--reader-icon-hover-bg);
  }
</style>
