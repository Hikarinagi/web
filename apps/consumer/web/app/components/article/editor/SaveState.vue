<script setup lang="ts">
  import { Center, Spinner } from '@hina-ui/vue'
  import { AlertCircle, Check, PencilLine } from '@lucide/vue'
  import { AnimatePresence, motion } from 'motion-v'
  import { TRANSITION_FAST } from '~/lib/motion'
  import type { SaveState } from './composables/useArticleEditor'

  defineOptions({ name: 'ArticleEditorSaveState' })

  const props = defineProps<{ state: SaveState; savedAt: Date | null }>()

  const SLOT = 'absolute inset-0 inline-flex items-center justify-center'

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
  <Center
    v-tooltip="detail"
    inline
    :aria-label="detail"
    role="status"
    class="relative size-4 flex-none"
  >
    <AnimatePresence>
      <motion.span
        v-if="state === 'saving'"
        key="saving"
        :class="SLOT"
        :initial="{ opacity: 0, scale: 0.7 }"
        :animate="{ opacity: 1, scale: 1 }"
        :exit="{ opacity: 0, scale: 0.7 }"
        :transition="TRANSITION_FAST"
      >
        <Spinner size="sm" aria-hidden="true" />
      </motion.span>
      <motion.span
        v-else-if="state === 'error'"
        key="error"
        :class="cn(SLOT, 'text-danger-text')"
        :initial="{ opacity: 0, scale: 0.7 }"
        :animate="{ opacity: 1, scale: 1 }"
        :exit="{ opacity: 0, scale: 0.7 }"
        :transition="TRANSITION_FAST"
      >
        <AlertCircle class="size-3.5" />
      </motion.span>
      <motion.span
        v-else-if="state === 'saved'"
        key="saved"
        :class="cn(SLOT, 'text-success-text')"
        :initial="{ opacity: 0, scale: 0.7 }"
        :animate="{ opacity: 1, scale: 1 }"
        :exit="{ opacity: 0, scale: 0.7 }"
        :transition="TRANSITION_FAST"
      >
        <Check class="size-3.5" />
      </motion.span>
      <motion.span
        v-else
        key="idle"
        :class="cn(SLOT, 'text-muted')"
        :initial="{ opacity: 0, scale: 0.7 }"
        :animate="{ opacity: 1, scale: 1 }"
        :exit="{ opacity: 0, scale: 0.7 }"
        :transition="TRANSITION_FAST"
      >
        <PencilLine class="size-3.5" />
      </motion.span>
    </AnimatePresence>
  </Center>
</template>
