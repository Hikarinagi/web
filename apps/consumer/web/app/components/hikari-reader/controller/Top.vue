<script setup lang="ts">
  import { Heading, IconButton, Stack, Text } from '@hina-ui/vue'
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
        'reader-bar absolute inset-x-3 top-[max(env(safe-area-inset-top),0.75rem)] z-20 flex items-center gap-2',
        'pointer-events-auto mx-auto max-w-2xl',
        'rounded-full px-1.5 py-1 sm:px-2 sm:py-1.5',
      )
    "
    :initial="{ opacity: 0, y: -14 }"
    :animate="{ opacity: 1, y: 0 }"
    :exit="{ opacity: 0, y: -14 }"
    @pointerenter="emit('hoverStart')"
    @pointerleave="emit('hoverEnd')"
  >
    <IconButton
      label="后退"
      :tooltip="false"
      variant="ghost"
      tone="neutral"
      pill
      class="reader-bar-button shrink-0"
      @click="emit('back')"
    >
      <ArrowLeft />
    </IconButton>

    <Stack gap="none" class="min-w-0 flex-1 px-2 text-center sm:px-3">
      <Text size="xs" truncate class="leading-tight text-(--reader-text-muted)">
        {{ subtitle }}
      </Text>
      <Heading :level="1" size="xs" truncate class="leading-tight text-(--reader-text) sm:text-sm">
        {{ title }}
      </Heading>
    </Stack>

    <IconButton
      :label="hasCurrentBookmark ? '当前位置已添加' : '添加书签'"
      :tooltip="false"
      variant="ghost"
      tone="neutral"
      pill
      class="reader-bar-button shrink-0"
      :disabled="!loaded || hasCurrentBookmark"
      @click="emit('addBookmark')"
    >
      <BookmarkCheck v-if="hasCurrentBookmark" />
      <BookmarkPlus v-else />
    </IconButton>

    <IconButton
      label="打开目录"
      :tooltip="false"
      variant="ghost"
      tone="neutral"
      pill
      class="reader-bar-button shrink-0"
      :disabled="!tocAvailable"
      @click="emit('openCatalog')"
    >
      <ListTree />
    </IconButton>

    <AuthGateButton
      label="报告渲染问题"
      :tooltip="false"
      variant="ghost"
      tone="neutral"
      pill
      class="reader-bar-button shrink-0"
      @click="emit('openReport')"
    >
      <Flag />
    </AuthGateButton>
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
</style>
