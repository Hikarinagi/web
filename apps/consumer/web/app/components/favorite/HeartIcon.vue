<script setup lang="ts">
  import { Heart } from '@lucide/vue'
  import { AnimatePresence, motion } from 'motion-v'
  import { EASE, TRANSITION_FAST } from '~/lib/motion'

  defineOptions({ name: 'FavoriteHeartIcon' })

  const props = withDefaults(
    defineProps<{
      favorited: boolean
      variant?: 'icon' | 'bar'
    }>(),
    { variant: 'icon' },
  )

  const burstVisible = ref(false)
  const burstKey = ref(0)
  let burstTimer: ReturnType<typeof setTimeout> | undefined

  const BURST_DOTS = [
    { x: -14, y: -7 },
    { x: -8, y: -14 },
    { x: 9, y: -13 },
    { x: 15, y: -4 },
    { x: 10, y: 11 },
    { x: -11, y: 10 },
  ] as const
  const HEART_POP = {
    duration: 0.42,
    ease: EASE,
    times: [0, 0.35, 0.68, 1],
  }
  const BURST_TRANSITION = { duration: 0.46, ease: EASE }

  const activeClass = computed(() =>
    props.favorited ? 'fill-red-500 text-red-500' : 'fill-transparent',
  )
  const iconSizeClass = computed(() => (props.variant === 'icon' ? 'size-[18px]' : 'size-[1em]'))
  const heartState = computed(() =>
    props.favorited && burstVisible.value
      ? { scale: [1, 1.28, 0.94, 1], rotate: [0, -9, 4, 0] }
      : { scale: 1, rotate: 0 },
  )
  const heartTransition = computed(() => (props.favorited ? HEART_POP : TRANSITION_FAST))

  watch(
    () => props.favorited,
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
      }, 480)
    },
  )

  onUnmounted(() => {
    if (burstTimer) clearTimeout(burstTimer)
  })
</script>

<template>
  <motion.span
    class="relative inline-flex shrink-0 items-center justify-center overflow-visible"
    :class="iconSizeClass"
  >
    <AnimatePresence :initial="false">
      <motion.span
        v-if="burstVisible"
        :key="burstKey"
        class="pointer-events-none absolute inset-0 flex items-center justify-center"
      >
        <motion.span
          class="absolute size-[1.7em] rounded-full border border-red-400/55"
          :initial="{ opacity: 0.5, scale: 0.55 }"
          :animate="{ opacity: 0, scale: 1.85 }"
          :exit="{ opacity: 0 }"
          :transition="BURST_TRANSITION"
        />
        <motion.span
          v-for="dot in BURST_DOTS"
          :key="`${dot.x}:${dot.y}`"
          class="absolute size-[0.22em] rounded-full bg-red-400"
          :initial="{ x: 0, y: 0, opacity: 0.9, scale: 1 }"
          :animate="{ x: dot.x, y: dot.y, opacity: 0, scale: 0 }"
          :exit="{ opacity: 0 }"
          :transition="BURST_TRANSITION"
        />
      </motion.span>
    </AnimatePresence>

    <motion.span
      :key="burstKey"
      class="relative z-10 inline-flex size-full origin-center items-center justify-center"
      :animate="heartState"
      :transition="heartTransition"
      :while-press="{ scale: 0.86 }"
    >
      <Heart class="size-full transition-colors duration-150" :class="activeClass" />
    </motion.span>
  </motion.span>
</template>
