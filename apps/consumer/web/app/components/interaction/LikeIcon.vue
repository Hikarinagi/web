<script setup lang="ts">
  import { ThumbsUp } from '@lucide/vue'
  import { AnimatePresence, motion } from 'motion-v'
  import { EASE, TRANSITION_FAST } from '~/lib/motion'

  defineOptions({ name: 'InteractionLikeIcon' })

  const props = defineProps<{ active: boolean }>()

  const burstVisible = ref(false)
  const burstKey = ref(0)
  let burstTimer: ReturnType<typeof setTimeout> | undefined

  const BURST_DOTS = [
    { x: -12, y: -5 },
    { x: -5, y: -13 },
    { x: 9, y: -11 },
    { x: 14, y: 2 },
    { x: 5, y: 12 },
  ] as const
  const LIKE_POP = {
    duration: 0.36,
    ease: EASE,
    times: [0, 0.36, 0.72, 1],
  }
  const BURST_TRANSITION = { duration: 0.4, ease: EASE }

  const activeClass = computed(() => (props.active ? 'fill-current' : 'fill-transparent'))
  const iconState = computed(() =>
    props.active && burstVisible.value
      ? { scale: [1, 1.2, 0.95, 1], y: [0, -2, 0, 0], rotate: [0, -7, 3, 0] }
      : { scale: 1, y: 0, rotate: 0 },
  )
  const iconTransition = computed(() => (props.active ? LIKE_POP : TRANSITION_FAST))

  watch(
    () => props.active,
    (next, prev) => {
      if (!next) {
        burstVisible.value = false
        if (burstTimer) clearTimeout(burstTimer)
        return
      }
      if (prev) return
      burstKey.value += 1
      burstVisible.value = true
      if (burstTimer) clearTimeout(burstTimer)
      burstTimer = setTimeout(() => {
        burstVisible.value = false
      }, 420)
    },
  )

  onUnmounted(() => {
    if (burstTimer) clearTimeout(burstTimer)
  })
</script>

<template>
  <motion.span
    class="relative inline-flex size-[1em] shrink-0 items-center justify-center overflow-visible"
  >
    <AnimatePresence :initial="false">
      <motion.span
        v-if="burstVisible"
        :key="burstKey"
        class="pointer-events-none absolute inset-0 flex items-center justify-center"
      >
        <motion.span
          class="absolute size-[1.55em] rounded-full border border-current opacity-40"
          :initial="{ opacity: 0.36, scale: 0.55 }"
          :animate="{ opacity: 0, scale: 1.65 }"
          :exit="{ opacity: 0 }"
          :transition="BURST_TRANSITION"
        />
        <motion.span
          v-for="dot in BURST_DOTS"
          :key="`${dot.x}:${dot.y}`"
          class="absolute size-[0.18em] rounded-full bg-current"
          :initial="{ x: 0, y: 0, opacity: 0.75, scale: 1 }"
          :animate="{ x: dot.x, y: dot.y, opacity: 0, scale: 0 }"
          :exit="{ opacity: 0 }"
          :transition="BURST_TRANSITION"
        />
      </motion.span>
    </AnimatePresence>

    <motion.span
      :key="burstKey"
      class="relative z-10 inline-flex size-full origin-center items-center justify-center"
      :animate="iconState"
      :transition="iconTransition"
      :while-press="{ scale: 0.88 }"
    >
      <ThumbsUp class="size-full transition-colors duration-150" :class="activeClass" />
    </motion.span>
  </motion.span>
</template>
