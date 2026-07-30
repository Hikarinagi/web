<script setup lang="ts">
  import { ArrowLeft, BookmarkCheck, BookmarkPlus, Flag, ListTree } from '@lucide/vue'
  import { motion } from 'motion-v'
  import { cn } from '~/utils/cn'

  defineProps<{
    title: string
    subtitle: string
    loading: boolean
    loaded: boolean
    tocAvailable: boolean
    hasCurrentBookmark: boolean
  }>()

  const emit = defineEmits<{
    back: []
    openCatalog: []
    addBookmark: []
    openReport: []
    hoverStart: []
    hoverEnd: []
  }>()
</script>

<template>
  <motion.div
    data-reader-ui
    :class="
      cn(
        'reader-bar absolute top-[max(env(safe-area-inset-top),0.75rem)] left-1/2 z-20 flex items-center gap-2',
        'pointer-events-auto w-[calc(100vw-1.5rem)] max-w-[calc(100vw-1.5rem)] sm:w-full sm:max-w-2xl',
        'rounded-full px-1.5 py-1 sm:px-2 sm:py-1.5',
      )
    "
    :style="{ translate: '-50% 0' }"
    :initial="{ opacity: 0, y: -14 }"
    :animate="{ opacity: 1, y: 0 }"
    :exit="{ opacity: 0, y: -14 }"
    @pointerenter="emit('hoverStart')"
    @pointerleave="emit('hoverEnd')"
  >
    <Button
      rounded
      severity="secondary"
      variant="text"
      class="reader-bar-button shrink-0"
      aria-label="后退"
      @click="emit('back')"
    >
      <template #icon>
        <ArrowLeft :size="18" aria-hidden="true" />
      </template>
    </Button>

    <div class="reader-bar-title min-w-0 flex-1 px-2 text-center sm:px-3">
      <p class="truncate text-[11px] leading-tight sm:text-xs">{{ subtitle }}</p>
      <h1 class="truncate text-xs leading-tight font-semibold sm:text-sm">
        {{ title }}
      </h1>
    </div>

    <Button
      rounded
      severity="secondary"
      variant="text"
      class="reader-bar-button shrink-0"
      :disabled="!loaded || hasCurrentBookmark"
      :aria-label="hasCurrentBookmark ? '当前位置已添加' : '添加书签'"
      @click="emit('addBookmark')"
    >
      <template #icon>
        <BookmarkCheck v-if="hasCurrentBookmark" :size="18" aria-hidden="true" />
        <BookmarkPlus v-else :size="18" aria-hidden="true" />
      </template>
    </Button>

    <Button
      rounded
      severity="secondary"
      variant="text"
      class="reader-bar-button shrink-0"
      :disabled="!tocAvailable"
      aria-label="打开目录"
      @click="emit('openCatalog')"
    >
      <template #icon>
        <ListTree :size="18" aria-hidden="true" />
      </template>
    </Button>

    <Button
      login-required
      rounded
      severity="secondary"
      variant="text"
      class="reader-bar-button shrink-0"
      aria-label="报告渲染问题"
      @click="emit('openReport')"
    >
      <template #icon>
        <Flag :size="18" aria-hidden="true" />
      </template>
    </Button>
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

  .reader-bar-title p {
    color: var(--reader-text-muted);
  }

  .reader-bar-title h1 {
    color: var(--reader-text);
  }
</style>
