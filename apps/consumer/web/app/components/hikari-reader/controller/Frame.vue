<script setup lang="ts">
  import { AnimatePresence } from 'motion-v'

  defineProps<{
    visible: boolean
    title: string
    subtitle: string
    progressValue: number
    progressLabel: string
    spreadLabel: string
    loading: boolean
    loaded: boolean
    canGoPrevious: boolean
    canGoNext: boolean
    tocAvailable: boolean
    hasCurrentBookmark: boolean
    showProgress: boolean
    showTime: boolean
    showSettingsButton: boolean
    timeLabel: string
  }>()

  const emit = defineEmits<{
    back: []
    previous: []
    next: []
    retry: []
    openCatalog: []
    openSettings: []
    addBookmark: []
    openReport: []
    hoverStart: []
    hoverEnd: []
  }>()
</script>

<template>
  <AnimatePresence>
    <HikariReaderControllerTop
      v-if="visible"
      key="reader-top-controls"
      :title="title"
      :subtitle="subtitle"
      :loading="loading"
      :loaded="loaded"
      :toc-available="tocAvailable"
      :has-current-bookmark="hasCurrentBookmark"
      @back="emit('back')"
      @open-catalog="emit('openCatalog')"
      @add-bookmark="emit('addBookmark')"
      @open-report="emit('openReport')"
      @hover-start="emit('hoverStart')"
      @hover-end="emit('hoverEnd')"
    />
  </AnimatePresence>

  <AnimatePresence>
    <HikariReaderControllerBottom
      v-if="visible"
      key="reader-bottom-controls"
      :progress-value="progressValue"
      :progress-label="progressLabel"
      :spread-label="spreadLabel"
      :can-go-previous="canGoPrevious"
      :can-go-next="canGoNext"
      :show-progress="showProgress"
      :show-time="showTime"
      :show-settings-button="showSettingsButton"
      :time-label="timeLabel"
      @previous="emit('previous')"
      @next="emit('next')"
      @open-settings="emit('openSettings')"
      @hover-start="emit('hoverStart')"
      @hover-end="emit('hoverEnd')"
    />
  </AnimatePresence>
</template>
