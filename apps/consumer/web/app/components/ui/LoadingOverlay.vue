<script setup lang="ts">
  import type { ClassValue } from 'clsx'
  import { AnimatePresence, motion } from 'motion-v'
  import { TRANSITION_FAST } from '~/lib/motion'

  defineOptions({ name: 'HikariLoadingOverlay', inheritAttrs: false })

  const props = withDefaults(
    defineProps<{
      loading?: boolean
      label?: string
      contentClass?: ClassValue
      dimContent?: boolean
      showSpinner?: boolean
    }>(),
    {
      contentClass: undefined,
      dimContent: true,
      label: '加载中',
      showSpinner: false,
    },
  )

  const attrs = useAttrs()
  const rootAttrs = computed(() => {
    const { class: _class, ...rest } = attrs
    return rest
  })
  const rootClass = computed(() => cn('relative min-w-0', attrs.class as ClassValue))
  const contentClassValue = computed(() =>
    cn('min-w-0', props.loading && 'pointer-events-none', props.contentClass),
  )
</script>

<template>
  <div v-bind="rootAttrs" :class="rootClass" :aria-busy="loading || undefined">
    <motion.div
      :class="contentClassValue"
      :animate="{ opacity: loading && dimContent ? 0.5 : 1 }"
      :transition="TRANSITION_FAST"
    >
      <slot />
    </motion.div>

    <AnimatePresence :initial="false">
      <motion.div
        v-if="loading"
        :initial="{ opacity: 0 }"
        :animate="{ opacity: 1 }"
        :exit="{ opacity: 0 }"
        :transition="TRANSITION_FAST"
        class="absolute inset-0 z-10 flex items-center justify-center rounded-[inherit] bg-surface-0/55 backdrop-blur-[1px] dark:bg-surface-950/45"
        role="status"
        aria-live="polite"
        :aria-label="label"
      >
        <Spinner v-if="showSpinner" :size="28" :label="null" />
      </motion.div>
    </AnimatePresence>
  </div>
</template>
