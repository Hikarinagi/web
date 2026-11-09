<script setup lang="ts">
  defineOptions({ name: 'LandingPickRing' })
  const props = withDefaults(
    defineProps<{ running: boolean; paused: boolean; cycle: string | number; round?: string }>(),
    { round: 'var(--radius-lg)' },
  )
  const emit = defineEmits<{ done: [] }>()

  const shape = computed(() => ({
    width: 'calc(100% - 2px)',
    height: 'calc(100% - 2px)',
    rx: props.round,
  }))
</script>

<template>
  <svg aria-hidden="true" class="pointer-events-none absolute inset-0 size-full overflow-visible">
    <rect
      v-if="running"
      :key="cycle"
      x="1"
      y="1"
      :style="shape"
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
