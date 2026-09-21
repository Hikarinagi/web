<script setup lang="ts">
  import { Button, Flex, Inline, Space } from '@hina-ui/vue'
  import { ChevronLeft, ChevronRight, Columns2, Maximize, Settings2 } from '@lucide/vue'
  import type { MangaReaderFit, MangaReaderLayout } from './lib/settings'
  import { MANGA_READER_FIT_LABEL } from './lib/settings'
  import { MANGA_READER_CHROME_PILL, MANGA_READER_CHROME_PILL_ACTIVE } from './lib/chrome'

  defineOptions({ name: 'MangaReaderBottomBar' })

  const props = defineProps<{
    total: number
    filled: number
    layout: MangaReaderLayout
    fit: MangaReaderFit
    canGoNext: boolean
    canGoPrevious: boolean
    showLayoutControls: boolean
  }>()

  const emit = defineEmits<{
    next: []
    previous: []
    jump: [page: number]
    toggleLayout: []
    cycleFit: []
    openSettings: [event: Event]
  }>()

  const fitLabel = computed(() => MANGA_READER_FIT_LABEL[props.fit])
  const step = computed(() => (props.layout === 'double' ? 2 : 1))
</script>

<template>
  <Flex
    direction="col-reverse"
    gap="sm"
    class="pointer-events-none bg-gradient-to-t from-neutral-1000/75 to-transparent px-4 pt-14 pb-3 sm:flex-row sm:items-center sm:gap-6 sm:px-6"
  >
    <Inline
      :wrap="false"
      gap="sm"
      class="pointer-events-auto justify-center sm:shrink-0 sm:justify-start"
    >
      <Button
        variant="ghost"
        size="sm"
        pill
        :class="MANGA_READER_CHROME_PILL"
        :disabled="!canGoNext"
        @click="emit('next')"
      >
        <template #icon><ChevronLeft aria-hidden="true" /></template>
        下一页
      </Button>
      <Button
        variant="ghost"
        size="sm"
        pill
        :class="MANGA_READER_CHROME_PILL"
        :disabled="!canGoPrevious"
        @click="emit('previous')"
      >
        上一页
        <template #trailing><ChevronRight aria-hidden="true" /></template>
      </Button>

      <Space v-if="showLayoutControls" size="sm" />
      <Button
        v-if="showLayoutControls"
        variant="ghost"
        size="sm"
        pill
        :class="layout === 'double' ? MANGA_READER_CHROME_PILL_ACTIVE : MANGA_READER_CHROME_PILL"
        @click="emit('toggleLayout')"
      >
        <template #icon><Columns2 aria-hidden="true" /></template>
        双页
      </Button>
      <Button
        v-if="showLayoutControls"
        v-tooltip="'图片适应'"
        variant="ghost"
        size="sm"
        pill
        :class="MANGA_READER_CHROME_PILL"
        @click="emit('cycleFit')"
      >
        <template #icon><Maximize aria-hidden="true" /></template>
        {{ fitLabel }}
      </Button>

      <Space size="sm" />
      <Button
        variant="ghost"
        size="sm"
        pill
        :class="MANGA_READER_CHROME_PILL"
        @click="(event: MouseEvent) => emit('openSettings', event)"
      >
        <template #icon><Settings2 aria-hidden="true" /></template>
        设置
      </Button>
    </Inline>

    <MangaReaderProgressScrubber
      v-if="total > 1"
      :total="total"
      :filled="filled"
      :step="step"
      class="pointer-events-auto sm:min-w-0 sm:flex-1"
      @jump="page => emit('jump', page)"
    />
  </Flex>
</template>
