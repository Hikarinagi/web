<script setup lang="ts">
  import { Tour } from '@hina-ui/vue'
  import type { ReadingPosition } from '@ritojs/kit'
  import { useMediaQuery } from '@vueuse/core'
  import { useReader } from '~/features/light-novel-reader/context'
  import { tourSteps } from '~/features/light-novel-reader/tour'

  defineOptions({ name: 'LightNovelReaderTour' })

  const reader = useReader()
  const { tour, shell, settings, engine } = reader
  const { open, step } = tour
  const coarse = useMediaQuery('(pointer: coarse)')
  const touch = computed(() => shell.phone.value || coarse.value)

  const steps = computed(() =>
    tourSteps(reader, {
      phone: shell.phone.value,
      touch: touch.value,
      tapTurn: settings.device.value.tapTurn,
      guide: settings.device.value.showGuide,
    }),
  )

  let origin: { spread: number; position: ReadingPosition | null } | null = null
  watch(open, shown => {
    const controller = engine.stack.value?.controller
    if (shown) {
      origin = controller
        ? { spread: controller.currentSpread, position: controller.position }
        : null
      return
    }
    if (controller && origin && controller.currentSpread !== origin.spread) {
      if (origin.position) void controller.goToPosition(origin.position)
      else controller.goToSpread(origin.spread)
    }
    origin = null
  })
</script>

<template>
  <Tour
    v-model:open="open"
    v-model:step="step"
    :steps="steps"
    mask="dim"
    block-page
    :pointer="touch ? 'touch' : 'mouse'"
  />
</template>
