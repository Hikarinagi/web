<script setup lang="ts">
  import { RotateCcw } from '@lucide/vue'
  import { motion } from 'motion-v'

  defineOptions({ name: 'HikariReaderLinkReturnPrompt' })

  defineProps<{
    label: string
  }>()

  const emit = defineEmits<{
    back: []
  }>()
</script>

<template>
  <motion.div
    data-reader-ui
    class="reader-link-return fixed left-1/2 z-30 flex w-[calc(100vw-1.5rem)] max-w-2xl items-center gap-3 rounded-full px-4 py-2"
    :style="{ translate: '-50% 0' }"
    :initial="{ opacity: 0, scale: 0.96, y: 8 }"
    :animate="{ opacity: 1, scale: 1, y: 0 }"
    :exit="{ opacity: 0, scale: 0.96, y: 6 }"
  >
    <span class="min-w-0 flex-1 truncate text-sm">已跳转到 {{ label }}</span>
    <Button
      rounded
      severity="secondary"
      size="small"
      label="返回"
      class="reader-link-return-button shrink-0"
      @click="emit('back')"
    >
      <template #icon>
        <RotateCcw :size="14" aria-hidden="true" />
      </template>
    </Button>
  </motion.div>
</template>

<style scoped>
  .reader-link-return {
    bottom: calc(max(env(safe-area-inset-bottom), 0.75rem) + 4.25rem);
    background: var(--reader-bar-bg);
    border: 1px solid var(--reader-bar-border);
    box-shadow: var(--reader-bar-shadow);
    color: var(--reader-text);
    backdrop-filter: blur(18px) saturate(1.6);
    -webkit-backdrop-filter: blur(18px) saturate(1.6);
  }

  .reader-link-return :deep(.p-button) {
    color: var(--reader-icon);
    transition: background-color 140ms ease;
  }

  .reader-link-return-button {
    white-space: nowrap;
  }

  .reader-link-return :deep(.p-button:not(:disabled):hover),
  .reader-link-return :deep(.p-button:not(:disabled):focus-visible) {
    background: var(--reader-icon-hover-bg);
  }

  @media (max-width: 640px) {
    .reader-link-return {
      bottom: max(env(safe-area-inset-bottom), 0.75rem);
    }
  }
</style>
