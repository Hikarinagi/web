<script setup lang="ts">
  import { cn } from '~/utils/cn'

  defineOptions({ name: 'LandingPickRing' })
  const props = withDefaults(
    defineProps<{
      running: boolean
      paused: boolean
      cycle: string | number
      round?: string
      seconds?: number | null
    }>(),
    { round: 'var(--radius-lg)', seconds: null },
  )
  const emit = defineEmits<{ done: [] }>()

  const shape = computed(() => ({
    width: 'calc(100% - 2px)',
    height: 'calc(100% - 2px)',
    rx: props.round,
  }))
  const timed = computed(() =>
    props.seconds ? { ...shape.value, animationDuration: `${props.seconds}s` } : shape.value,
  )
</script>

<template>
  <svg aria-hidden="true" class="pointer-events-none absolute inset-0 size-full overflow-visible">
    <rect
      v-if="running"
      :key="cycle"
      x="1"
      y="1"
      :style="timed"
      fill="none"
      stroke-width="2"
      pathLength="1"
      stroke-dasharray="1"
      :class="cn('animate-stage-ring stroke-accent', paused && '[animation-play-state:paused]')"
      @animationend="emit('done')"
    />
    <rect v-else x="1" y="1" :style="shape" fill="none" stroke-width="2" class="stroke-accent" />
  </svg>
</template>
