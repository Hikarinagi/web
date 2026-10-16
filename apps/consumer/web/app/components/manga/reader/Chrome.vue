<script setup lang="ts">
  import { AnimatePresence, motion } from 'motion-v'

  defineOptions({ name: 'MangaReaderChrome' })

  defineProps<{ visible: boolean }>()
</script>

<template>
  <AnimatePresence>
    <motion.div
      v-if="visible"
      key="manga-reader-top"
      class="absolute inset-x-0 top-0 z-20"
      :initial="{ opacity: 0, y: -8 }"
      :animate="{ opacity: 1, y: 0 }"
      :exit="{ opacity: 0, y: -8 }"
    >
      <slot name="top" />
    </motion.div>
  </AnimatePresence>
  <AnimatePresence>
    <motion.div
      v-if="visible"
      key="manga-reader-bottom"
      class="absolute inset-x-0 bottom-0 z-20"
      :initial="{ opacity: 0, y: 8 }"
      :animate="{ opacity: 1, y: 0 }"
      :exit="{ opacity: 0, y: 8 }"
    >
      <slot name="bottom" />
    </motion.div>
  </AnimatePresence>
</template>
