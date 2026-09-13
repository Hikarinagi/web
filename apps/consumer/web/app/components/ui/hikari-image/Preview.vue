<script setup lang="ts">
  import { ChevronLeft, ChevronRight } from '@lucide/vue'
  import { motion, AnimatePresence } from 'motion-v'
  import { blockBodyScroll, unblockBodyScroll } from 'primevue/utils'
  import { EASE } from '~/lib/motion'
  import { useHikariImagePreview } from './composables/usePreview'
  import PreviewViewer from './PreviewViewer.vue'

  defineOptions({ name: 'HikariImagePreview', inheritAttrs: false })

  const { isOpen, current, index, items, hasMultiple, close } = useHikariImagePreview()
  const contentTransition = { duration: 0.32, ease: EASE }
  const contentHidden = { opacity: 0, scale: 0.97 }
  const contentShown = { opacity: 1, scale: 1 }
  const controlHidden = { opacity: 0 }
  const controlShown = { opacity: 1 }

  const viewerRef = ref<InstanceType<typeof PreviewViewer> | null>(null)

  function triggerPrev() {
    if (!hasMultiple.value) return
    viewerRef.value?.navigate(-1)
  }

  function triggerNext() {
    if (!hasMultiple.value) return
    viewerRef.value?.navigate(1)
  }

  function onKeydown(event: KeyboardEvent) {
    if (!isOpen.value) return
    if (event.key === 'Escape') close()
    else if (event.key === 'ArrowRight') triggerNext()
    else if (event.key === 'ArrowLeft') triggerPrev()
  }

  watchEffect(onCleanup => {
    if (!import.meta.client) return
    if (!isOpen.value) return
    blockBodyScroll()
    window.addEventListener('keydown', onKeydown)
    onCleanup(() => {
      unblockBodyScroll()
      window.removeEventListener('keydown', onKeydown)
    })
  })
</script>

<template>
  <Teleport to="body">
    <AnimatePresence>
      <motion.div
        v-if="isOpen"
        key="mask"
        class="p-overlay-mask hikari-image-preview-mask z-12000"
        :initial="{ opacity: 0 }"
        :animate="{ opacity: 1 }"
        :exit="{ opacity: 0 }"
        aria-hidden="true"
      />
    </AnimatePresence>

    <AnimatePresence>
      <motion.div
        v-if="isOpen && current"
        key="content"
        class="hikari-image-preview-content z-12001"
        :initial="contentHidden"
        :animate="contentShown"
        :exit="contentHidden"
        :transition="contentTransition"
        role="dialog"
        aria-modal="true"
      >
        <PreviewViewer ref="viewerRef" @backdrop="close" />
      </motion.div>
    </AnimatePresence>

    <AnimatePresence>
      <motion.div
        v-if="isOpen && hasMultiple"
        key="controls"
        class="hikari-image-preview-controls z-12002 hidden md:block"
        :initial="controlHidden"
        :animate="controlShown"
        :exit="controlHidden"
      >
        <Button
          aria-label="上一张"
          severity="contrast"
          variant="text"
          rounded
          class="absolute! top-1/2 left-5 -translate-y-1/2"
          @click.stop="triggerPrev"
        >
          <template #icon>
            <ChevronLeft :size="22" aria-hidden="true" />
          </template>
        </Button>
        <Button
          aria-label="下一张"
          severity="contrast"
          variant="text"
          rounded
          class="absolute! top-1/2 right-5 -translate-y-1/2"
          @click.stop="triggerNext"
        >
          <template #icon>
            <ChevronRight :size="22" aria-hidden="true" />
          </template>
        </Button>
        <Badge
          class="absolute bottom-5 left-1/2 mr-(--p-scrollbar-width) -translate-x-1/2 select-none"
          severity="secondary"
          variant="text"
        >
          {{ index + 1 }} / {{ items.length }}
        </Badge>
      </motion.div>
    </AnimatePresence>
  </Teleport>
</template>

<style scoped>
  .hikari-image-preview-mask,
  .hikari-image-preview-content,
  .hikari-image-preview-controls {
    position: fixed;
    inset: 0;
    touch-action: none;
    overscroll-behavior: contain;
  }

  .hikari-image-preview-controls {
    pointer-events: none;
  }

  .hikari-image-preview-controls :deep(*) {
    pointer-events: auto;
  }
</style>
