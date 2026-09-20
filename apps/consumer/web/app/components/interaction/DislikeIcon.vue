<script setup lang="ts">
  import { ThumbsDown } from '@lucide/vue'
  import { motion } from 'motion-v'
  import { EASE, TRANSITION_FAST } from '~/lib/motion'

  defineOptions({ name: 'InteractionDislikeIcon' })

  const props = defineProps<{ active: boolean }>()

  const feedbackVisible = ref(false)
  const feedbackKey = ref(0)
  let feedbackTimer: ReturnType<typeof setTimeout> | undefined

  const DISLIKE_PUSH = {
    duration: 0.3,
    ease: EASE,
    times: [0, 0.42, 0.76, 1],
  }

  const activeClass = computed(() => (props.active ? 'fill-current' : 'fill-transparent'))
  const iconState = computed(() =>
    props.active && feedbackVisible.value
      ? { y: [0, 2, 0, 0], rotate: [0, 5, -2, 0] }
      : { y: 0, rotate: 0 },
  )
  const iconTransition = computed(() => (props.active ? DISLIKE_PUSH : TRANSITION_FAST))

  watch(
    () => props.active,
    (next, prev) => {
      if (!next) {
        feedbackVisible.value = false
        if (feedbackTimer) clearTimeout(feedbackTimer)
        return
      }
      if (prev) return
      feedbackKey.value += 1
      feedbackVisible.value = true
      if (feedbackTimer) clearTimeout(feedbackTimer)
      feedbackTimer = setTimeout(() => {
        feedbackVisible.value = false
      }, 340)
    },
  )

  onUnmounted(() => {
    if (feedbackTimer) clearTimeout(feedbackTimer)
  })
</script>

<template>
  <motion.span
    :key="feedbackKey"
    class="relative inline-flex size-[1em] shrink-0 origin-center items-center justify-center overflow-visible"
    :animate="iconState"
    :transition="iconTransition"
  >
    <ThumbsDown class="size-full transition-colors duration-150" :class="activeClass" />
  </motion.span>
</template>
