<script setup lang="ts">
  import { Card, Inline, Stack } from '@hina-ui/vue'

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
  <Inline align="center" gap="none" :wrap="false" class="gap-1.5 text-fg">
    <Card
      v-for="index in count"
      :key="index"
      as="button"
      :padded="false"
      class="flex h-4 cursor-pointer items-center border-0 bg-transparent shadow-none"
      :aria-label="`第 ${index} 张`"
      @click="emit('select', index - 1)"
    >
      <Stack
        gap="none"
        class="relative h-0.75 overflow-hidden rounded-full bg-current/25 transition-all duration-300"
        :class="index - 1 === current ? 'w-9' : 'w-4'"
      >
        <Stack
          gap="none"
          class="absolute inset-0 origin-left rounded-full bg-accent transition-transform duration-300"
          :class="fillClass(index - 1)"
          :style="
            fillClass(index - 1) === 'strip-fill'
              ? { animationPlayState: running ? 'running' : 'paused' }
              : undefined
          "
          @animationend="index - 1 === current && emit('elapsed')"
        />
      </Stack>
    </Card>
  </Inline>
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
