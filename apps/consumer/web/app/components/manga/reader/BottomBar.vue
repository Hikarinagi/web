<script setup lang="ts">
  import { ChevronLeft, ChevronRight, Columns2, Maximize, Settings2 } from '@lucide/vue'
  import { cn } from '~/utils/cn'
  import type { MangaReaderFit, MangaReaderLayout } from './lib/settings'
  import { MANGA_READER_FIT_LABEL } from './lib/settings'

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

  const pillClass =
    'inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full bg-white/12 py-[7px] text-xs text-white transition-colors hover:bg-white/20 disabled:cursor-default disabled:opacity-40'

  const fitLabel = computed(() => MANGA_READER_FIT_LABEL[props.fit])
</script>

<template>
  <div
    class="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-24 bg-gradient-to-b from-transparent to-black/70"
  >
    <div
      class="pointer-events-auto absolute inset-x-0 top-[30px] mx-auto w-[min(800px,calc(100%-32px))] sm:w-[min(800px,calc(100%-48px))]"
    >
      <MangaReaderProgressScrubber
        :total="total"
        :filled="filled"
        @jump="page => emit('jump', page)"
      />
    </div>
    <div
      class="pointer-events-auto absolute inset-x-0 bottom-0 flex h-12 items-center justify-center gap-3 px-3 sm:justify-start sm:gap-4 sm:px-6"
    >
      <p class="hidden shrink-0 text-[11px] text-[#b8c2d1] lg:block">右滑下一页 双击缩放</p>
      <span class="hidden w-2.5 shrink-0 lg:block" />
      <Button
        unstyled
        :class="cn(pillClass, 'pr-3 pl-2.5')"
        :disabled="!canGoNext"
        @click="emit('next')"
      >
        <ChevronLeft :size="15" aria-hidden="true" />
        下一页
      </Button>
      <Button
        unstyled
        :class="cn(pillClass, 'pr-3 pl-2.5')"
        :disabled="!canGoPrevious"
        @click="emit('previous')"
      >
        <ChevronRight :size="15" aria-hidden="true" />
        上一页
      </Button>
      <span v-if="showLayoutControls" class="w-2.5 shrink-0" />
      <Button
        v-if="showLayoutControls"
        unstyled
        :class="
          cn(
            pillClass,
            'px-3',
            layout === 'double' && 'bg-primary/20 text-primary hover:bg-primary/30',
          )
        "
        @click="emit('toggleLayout')"
      >
        <Columns2 :size="15" aria-hidden="true" />
        双页
      </Button>
      <Button
        v-if="showLayoutControls"
        v-tooltip.top="'图片适应'"
        unstyled
        :class="cn(pillClass, 'px-3')"
        @click="emit('cycleFit')"
      >
        <Maximize :size="15" aria-hidden="true" />
        {{ fitLabel }}
      </Button>
      <Button unstyled :class="cn(pillClass, 'px-3')" @click="event => emit('openSettings', event)">
        <Settings2 :size="15" aria-hidden="true" />
        设置
      </Button>
    </div>
  </div>
</template>
