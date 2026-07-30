<script setup lang="ts">
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
    <div class="flex items-center justify-between gap-1 px-1">
      <HikariReaderAnnotationColorPicker
        size="sm"
        :model-value="annotation.color"
        @update:model-value="emit('changeColor', $event)"
      />
    </div>

    <p
      v-if="annotation.note"
      class="line-clamp-3 px-1 text-xs leading-5"
      :style="{ color: 'var(--reader-text-muted)' }"
    >
      {{ annotation.note }}
    </p>

    <div class="reader-action-divider" />

    <div class="flex items-center justify-end gap-1">
      <Button
        severity="secondary"
        variant="text"
        size="small"
        rounded
        :aria-label="annotation.note ? '编辑笔记' : '添加标注'"
        @click="emit('editNote')"
      >
        <template #icon>
          <NotebookPen :size="14" aria-hidden="true" />
        </template>
      </Button>
      <Button
        severity="danger"
        variant="text"
        size="small"
        rounded
        aria-label="删除标注"
        @click="emit('remove')"
      >
        <template #icon>
          <Trash2 :size="14" aria-hidden="true" />
        </template>
      </Button>
    </div>
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
    -webkit-backdrop-filter: blur(18px) saturate(1.6);
  }

  .reader-action-divider {
    height: 1px;
    background: var(--reader-bar-border);
    margin: 0 -2px;
  }

  .reader-action-popover :deep(.p-button) {
    color: var(--reader-icon);
    transition: background-color 140ms ease;
  }

  .reader-action-popover :deep(.p-button:not(:disabled):hover),
  .reader-action-popover :deep(.p-button:not(:disabled):focus-visible) {
    background: var(--reader-icon-hover-bg);
  }
</style>
