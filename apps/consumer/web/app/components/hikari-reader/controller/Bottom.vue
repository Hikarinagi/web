<script setup lang="ts">
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
</script>

<template>
  <motion.div
    data-reader-ui
    :class="
      cn(
        'reader-bar absolute bottom-[max(env(safe-area-inset-bottom),0.75rem)] left-1/2 z-20 flex items-center gap-3 sm:gap-4',
        'pointer-events-auto w-[calc(100vw-1.5rem)] max-w-[calc(100vw-1.5rem)] sm:w-full sm:max-w-2xl',
        'rounded-full px-3 py-2 sm:px-4',
      )
    "
    :style="{ translate: '-50% 0' }"
    :initial="{ opacity: 0, y: 16 }"
    :animate="{ opacity: 1, y: 0 }"
    :exit="{ opacity: 0, y: 16 }"
    @pointerenter="emit('hoverStart')"
    @pointerleave="emit('hoverEnd')"
  >
    <span
      v-if="showTime"
      class="reader-bar-label shrink-0 text-[11px] font-medium tabular-nums sm:text-xs"
    >
      {{ timeLabel }}
    </span>

    <template v-if="showProgress">
      <span class="reader-bar-label shrink-0 text-[11px] tabular-nums sm:text-xs">
        {{ progressLabel }}
      </span>
      <ProgressBar
        :value="progressValue"
        class="reader-progress h-1! min-w-0 flex-1"
        :show-value="false"
      />
      <span class="reader-bar-label hidden shrink-0 text-xs tabular-nums sm:inline">
        {{ spreadLabel }}
      </span>
    </template>

    <div :class="cn('flex shrink-0 items-center gap-1', showProgress ? '' : 'ml-auto')">
      <Button
        v-if="showSettingsButton"
        rounded
        severity="secondary"
        variant="text"
        class="reader-bar-button"
        aria-label="阅读设置"
        @click="emit('openSettings')"
      >
        <template #icon>
          <Settings2 :size="18" aria-hidden="true" />
        </template>
      </Button>
      <Button
        rounded
        severity="secondary"
        variant="text"
        class="reader-bar-button"
        :disabled="!canGoPrevious"
        aria-label="上一页"
        @click="emit('previous')"
      >
        <template #icon>
          <ChevronLeft :size="18" aria-hidden="true" />
        </template>
      </Button>
      <Button
        rounded
        severity="secondary"
        variant="text"
        class="reader-bar-button"
        :disabled="!canGoNext"
        aria-label="下一页"
        @click="emit('next')"
      >
        <template #icon>
          <ChevronRight :size="18" aria-hidden="true" />
        </template>
      </Button>
    </div>
  </motion.div>
</template>

<style scoped>
  .reader-bar {
    background: var(--reader-bar-bg);
    border: 1px solid var(--reader-bar-border);
    box-shadow: var(--reader-bar-shadow);
    color: var(--reader-text);
    backdrop-filter: blur(18px) saturate(1.6);
    -webkit-backdrop-filter: blur(18px) saturate(1.6);
  }

  .reader-bar :deep(.p-button) {
    color: var(--reader-icon);
    transition: background-color 140ms ease;
  }

  .reader-bar :deep(.p-button:not(:disabled):hover),
  .reader-bar :deep(.p-button:not(:disabled):focus-visible) {
    background: var(--reader-icon-hover-bg);
  }

  .reader-bar-label {
    color: var(--reader-text-muted);
  }

  .reader-progress {
    background: color-mix(in srgb, var(--reader-text), transparent 86%) !important;
  }

  .reader-progress :deep(.p-progressbar-value) {
    background: var(--reader-text) !important;
  }
</style>
