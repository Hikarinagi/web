<script setup lang="ts">
  import { AlertCircle, Check, PencilLine } from '@lucide/vue'
  import { AnimatePresence, motion } from 'motion-v'
  import { TRANSITION_FAST } from '~/lib/motion'
  import type { SaveState } from './composables/useArticleEditor'

  defineOptions({ name: 'ArticleEditorSaveState' })

  const props = defineProps<{ state: SaveState; savedAt: Date | null }>()

  function clock(date: Date) {
    const h = date.getHours().toString().padStart(2, '0')
    const m = date.getMinutes().toString().padStart(2, '0')
    return `${h}:${m}`
  }

  const detail = computed(() => {
    if (props.state === 'saving') return '正在保存'
    if (props.state === 'error') return '保存失败，将在下次改动时重试'
    if (props.state === 'saved' && props.savedAt) return `已保存于 ${clock(props.savedAt)}`
    return '草稿尚未保存'
  })
</script>

<template>
  <div v-tooltip.top="detail" class="save-state" :aria-label="detail" role="status">
    <AnimatePresence>
      <motion.span
        v-if="state === 'saving'"
        key="saving"
        class="save-state__slot"
        :initial="{ opacity: 0, scale: 0.7 }"
        :animate="{ opacity: 1, scale: 1 }"
        :exit="{ opacity: 0, scale: 0.7 }"
        :transition="TRANSITION_FAST"
      >
        <Spinner :size="14" :label="null" />
      </motion.span>
      <motion.span
        v-else-if="state === 'error'"
        key="error"
        class="save-state__slot text-red-500"
        :initial="{ opacity: 0, scale: 0.7 }"
        :animate="{ opacity: 1, scale: 1 }"
        :exit="{ opacity: 0, scale: 0.7 }"
        :transition="TRANSITION_FAST"
      >
        <AlertCircle :size="14" />
      </motion.span>
      <motion.span
        v-else-if="state === 'saved'"
        key="saved"
        class="save-state__slot text-green-600 dark:text-green-500"
        :initial="{ opacity: 0, scale: 0.7 }"
        :animate="{ opacity: 1, scale: 1 }"
        :exit="{ opacity: 0, scale: 0.7 }"
        :transition="TRANSITION_FAST"
      >
        <Check :size="14" />
      </motion.span>
      <motion.span
        v-else
        key="idle"
        class="save-state__slot text-muted-color"
        :initial="{ opacity: 0, scale: 0.7 }"
        :animate="{ opacity: 1, scale: 1 }"
        :exit="{ opacity: 0, scale: 0.7 }"
        :transition="TRANSITION_FAST"
      >
        <PencilLine :size="14" />
      </motion.span>
    </AnimatePresence>
  </div>
</template>

<style scoped>
  .save-state {
    position: relative;
    display: inline-flex;
    width: 16px;
    height: 16px;
    flex: none;
  }
  .save-state__slot {
    position: absolute;
    inset: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }
</style>
