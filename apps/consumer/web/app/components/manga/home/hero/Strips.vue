<script setup lang="ts">
  defineOptions({ name: 'MangaHomeHeroStrips' })
  const props = defineProps<{
    count: number
    current: number
    cycle: number
    animated: boolean
    running: boolean
  }>()
  const emit = defineEmits<{ select: [index: number]; elapsed: [] }>()

  const draining = ref(false)
  let drainTimer: ReturnType<typeof setTimeout> | undefined
  watch(
    () => props.cycle,
    () => {
      draining.value = true
      clearTimeout(drainTimer)
      drainTimer = setTimeout(() => {
        draining.value = false
      }, 320)
    },
  )
  onUnmounted(() => clearTimeout(drainTimer))

  function fillClass(index: number) {
    if (index !== props.current) return 'strip-idle'
    if (!props.animated) return ''
    return draining.value ? 'strip-idle' : 'strip-fill'
  }
</script>

<template>
  <div class="flex items-center gap-1.5 text-color">
    <Button
      v-for="index in count"
      :key="index"
      unstyled
      class="flex h-4 cursor-pointer items-center"
      :aria-label="`第 ${index} 张`"
      @click="emit('select', index - 1)"
    >
      <span
        class="relative block h-0.75 overflow-hidden rounded-full bg-current/25 transition-all duration-300"
        :class="index - 1 === current ? 'w-9' : 'w-4'"
      >
        <span
          class="absolute inset-0 origin-left rounded-full bg-hikari-primary-500 transition-transform duration-300"
          :class="fillClass(index - 1)"
          :style="
            fillClass(index - 1) === 'strip-fill'
              ? { animationPlayState: running ? 'running' : 'paused' }
              : undefined
          "
          @animationend="index - 1 === current && emit('elapsed')"
        />
      </span>
    </Button>
  </div>
</template>

<style scoped>
  .strip-idle {
    transform: scaleX(0);
  }

  .strip-fill {
    animation: strip-fill 6000ms linear forwards;
  }

  @keyframes strip-fill {
    from {
      transform: scaleX(0);
    }

    to {
      transform: scaleX(1);
    }
  }
</style>
