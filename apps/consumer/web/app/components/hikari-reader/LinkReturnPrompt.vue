<script setup lang="ts">
  import { Button, Text } from '@hina-ui/vue'
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
    class="reader-link-return fixed inset-x-3 z-30 mx-auto flex max-w-2xl items-center gap-3 rounded-full px-4 py-2"
    :initial="{ opacity: 0, scale: 0.96, y: 8 }"
    :animate="{ opacity: 1, scale: 1, y: 0 }"
    :exit="{ opacity: 0, scale: 0.96, y: 6 }"
  >
    <Text as="span" size="sm" truncate class="min-w-0 flex-1 text-inherit">
      已跳转到 {{ label }}
    </Text>
    <Button
      variant="ghost"
      tone="neutral"
      size="sm"
      pill
      class="reader-link-return-button shrink-0 text-(--reader-icon)"
      @click="emit('back')"
    >
      <template #icon><RotateCcw /></template>
      返回
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
  }

  .reader-link-return-button {
    white-space: nowrap;
    transition: background-color 140ms ease;
  }

  .reader-link-return-button:not(:disabled):hover,
  .reader-link-return-button:not(:disabled):focus-visible {
    background: var(--reader-icon-hover-bg);
  }
</style>
