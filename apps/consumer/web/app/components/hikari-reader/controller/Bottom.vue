<script setup lang="ts">
  import { IconButton, Inline, Progress, Text } from '@hina-ui/vue'
  import { ChevronLeft, ChevronRight, Settings2 } from '@lucide/vue'
  import { motion } from 'motion-v'
  import { cn } from '~/utils/cn'

  defineProps<{
    progressValue: number
    progressLabel: string
    spreadLabel: string
    canGoPrevious: boolean
    canGoNext: boolean
    showProgress: boolean
    showTime: boolean
    showSettingsButton: boolean
    timeLabel: string
  }>()

  const emit = defineEmits<{
    previous: []
    next: []
    openSettings: []
    hoverStart: []
    hoverEnd: []
  }>()

  const LABEL = 'reader-bar-label shrink-0 tabular-nums'
</script>

<template>
  <motion.div
    data-reader-ui
    :class="
      cn(
        'reader-bar absolute inset-x-3 bottom-[max(env(safe-area-inset-bottom),0.75rem)] z-20 flex items-center gap-3 sm:gap-4',
        'pointer-events-auto mx-auto max-w-2xl',
        'rounded-full px-3 py-2 sm:px-4',
      )
    "
    :initial="{ opacity: 0, y: 16 }"
    :animate="{ opacity: 1, y: 0 }"
    :exit="{ opacity: 0, y: 16 }"
    @pointerenter="emit('hoverStart')"
    @pointerleave="emit('hoverEnd')"
  >
    <Text v-if="showTime" as="span" size="xs" weight="medium" :class="LABEL">
      {{ timeLabel }}
    </Text>

    <template v-if="showProgress">
      <Text as="span" size="xs" :class="LABEL">{{ progressLabel }}</Text>
      <Progress
        :value="progressValue"
        size="sm"
        aria-label="阅读进度"
        class="reader-progress min-w-0 flex-1"
      />
      <Text as="span" size="xs" :class="cn(LABEL, 'hidden sm:inline')">{{ spreadLabel }}</Text>
    </template>

    <Inline
      gap="xs"
      align="center"
      :wrap="false"
      :class="showProgress ? 'shrink-0' : 'ml-auto shrink-0'"
    >
      <IconButton
        v-if="showSettingsButton"
        label="阅读设置"
        :tooltip="false"
        variant="ghost"
        tone="neutral"
        pill
        class="reader-bar-button"
        @click="emit('openSettings')"
      >
        <Settings2 />
      </IconButton>
      <IconButton
        label="上一页"
        :tooltip="false"
        variant="ghost"
        tone="neutral"
        pill
        class="reader-bar-button"
        :disabled="!canGoPrevious"
        @click="emit('previous')"
      >
        <ChevronLeft />
      </IconButton>
      <IconButton
        label="下一页"
        :tooltip="false"
        variant="ghost"
        tone="neutral"
        pill
        class="reader-bar-button"
        :disabled="!canGoNext"
        @click="emit('next')"
      >
        <ChevronRight />
      </IconButton>
    </Inline>
  </motion.div>
</template>

<style scoped>
  .reader-bar {
    background: var(--reader-bar-bg);
    border: 1px solid var(--reader-bar-border);
    box-shadow: var(--reader-bar-shadow);
    color: var(--reader-text);
    backdrop-filter: blur(18px) saturate(1.6);
  }

  .reader-bar-button {
    color: var(--reader-icon);
    transition: background-color 140ms ease;
  }

  .reader-bar-button:not(:disabled):hover,
  .reader-bar-button:not(:disabled):focus-visible {
    background: var(--reader-icon-hover-bg);
  }

  .reader-bar-label {
    color: var(--reader-text-muted);
  }

  .reader-progress :deep([role='progressbar']) {
    background: color-mix(in srgb, var(--reader-text), transparent 86%);
  }

  .reader-progress :deep([role='progressbar'] > *) {
    background: var(--reader-text);
  }
</style>
