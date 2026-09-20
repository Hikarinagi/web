<script setup lang="ts">
  import { AnimatePresence, motion } from 'motion-v'
  import type { MangaReaderFit, MangaReaderLayout } from './lib/settings'

  defineOptions({ name: 'MangaReaderChrome' })

  defineProps<{
    visible: boolean
    title: string
    chapterLabel: string
    total: number
    filled: number
    layout: MangaReaderLayout
    fit: MangaReaderFit
    canGoNext: boolean
    canGoPrevious: boolean
    showLayoutControls: boolean
  }>()

  const emit = defineEmits<{
    back: []
    openCatalog: []
    next: []
    previous: []
    jump: [page: number]
    toggleLayout: []
    cycleFit: []
    openSettings: [event: Event]
  }>()
</script>

<template>
  <AnimatePresence>
    <motion.div
      v-if="visible"
      key="manga-reader-top"
      class="absolute inset-x-0 top-0 z-20"
      :initial="{ opacity: 0, y: -10 }"
      :animate="{ opacity: 1, y: 0 }"
      :exit="{ opacity: 0, y: -10 }"
    >
      <MangaReaderTopBar
        :title="title"
        :chapter-label="chapterLabel"
        @back="emit('back')"
        @open-catalog="emit('openCatalog')"
      />
    </motion.div>
  </AnimatePresence>

  <AnimatePresence>
    <motion.div
      v-if="visible"
      key="manga-reader-bottom"
      class="absolute inset-x-0 bottom-0 z-20"
      :initial="{ opacity: 0, y: 10 }"
      :animate="{ opacity: 1, y: 0 }"
      :exit="{ opacity: 0, y: 10 }"
    >
      <MangaReaderBottomBar
        :total="total"
        :filled="filled"
        :layout="layout"
        :fit="fit"
        :can-go-next="canGoNext"
        :can-go-previous="canGoPrevious"
        :show-layout-controls="showLayoutControls"
        @next="emit('next')"
        @previous="emit('previous')"
        @jump="page => emit('jump', page)"
        @toggle-layout="emit('toggleLayout')"
        @cycle-fit="emit('cycleFit')"
        @open-settings="event => emit('openSettings', event)"
      />
    </motion.div>
  </AnimatePresence>
</template>
