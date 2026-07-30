<script setup lang="ts">
  import { autoUpdate, flip, offset, shift, useFloating } from '@floating-ui/vue'
  import { AnimatePresence, motion } from 'motion-v'
  import type { CSSProperties } from 'vue'
  import { TRANSITION_FAST } from '~/lib/motion'
  import { useTooltip } from '~/composables/useTooltip'

  defineOptions({ name: 'LayoutTooltipHost' })

  const { target, content, placement, open } = useTooltip()
  const floating = useTemplateRef<HTMLElement>('floating')
  const reference = computed(() => target.value)
  const mounted = ref(false)
  const frozenStyles = shallowRef<CSSProperties | null>(null)

  const { floatingStyles } = useFloating(reference, floating, {
    placement,
    strategy: 'fixed',
    middleware: [offset(8), flip({ padding: 8 }), shift({ padding: 8 })],
    whileElementsMounted: (ref, float, update) =>
      autoUpdate(ref, float, update, { animationFrame: true }),
  })

  const hostStyle = computed(() => frozenStyles.value ?? floatingStyles.value)

  watch(
    open,
    isOpen => {
      if (isOpen) {
        frozenStyles.value = null
        mounted.value = true
        return
      }
      frozenStyles.value = { ...floatingStyles.value }
    },
    { flush: 'sync' },
  )

  const route = useRoute()
  watch(
    () => route.fullPath,
    () => {
      open.value = false
      target.value = null
      mounted.value = false
    },
  )

  function handleExitComplete() {
    if (!open.value) mounted.value = false
  }
</script>

<template>
  <Teleport to="body">
    <div v-if="mounted" ref="floating" :style="hostStyle" class="pointer-events-none z-12000">
      <AnimatePresence :on-exit-complete="handleExitComplete">
        <motion.div
          v-if="open && content"
          key="tooltip"
          role="tooltip"
          class="w-max max-w-72 rounded-md bg-surface-900 px-2.5 py-1.5 text-sm leading-snug text-surface-0 shadow-lg dark:bg-surface-700 dark:text-surface-100"
          :initial="{ opacity: 0, scale: 0.96 }"
          :animate="{ opacity: 1, scale: 1 }"
          :exit="{ opacity: 0, scale: 0.96 }"
          :transition="TRANSITION_FAST"
        >
          {{ content }}
        </motion.div>
      </AnimatePresence>
    </div>
  </Teleport>
</template>
