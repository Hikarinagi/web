<script setup lang="ts">
  import { Stack } from '@hina-ui/vue'
  import { useReader } from '~/features/light-novel-reader/context'
  import { cn } from '~/utils/cn'

  defineOptions({ name: 'LightNovelReaderDesktopColumn' })

  const props = defineProps<{ side: 'left' | 'right'; open: boolean; label: string }>()

  const { shell } = useReader()
  const width = computed(() =>
    props.side === 'left' ? shell.stored.value.leftWidth : shell.stored.value.rightWidth,
  )
  const drag = ref<{ x: number; width: number } | null>(null)

  function begin(event: PointerEvent) {
    event.preventDefault()
    if (event.button !== 0) return
    ;(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId)
    drag.value = { x: event.clientX, width: width.value }
  }

  function follow(event: PointerEvent) {
    const start = drag.value
    if (!start) return
    if (!event.buttons) {
      drag.value = null
      return
    }
    const delta = event.clientX - start.x
    shell.resize(props.side, start.width + (props.side === 'left' ? delta : -delta))
  }

  function step(event: KeyboardEvent) {
    const sign = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0
    if (!sign) return
    event.preventDefault()
    shell.resize(props.side, width.value + sign * (props.side === 'left' ? 16 : -16))
  }
</script>

<template>
  <Stack
    as="aside"
    gap="none"
    :aria-label="label"
    :inert="!open"
    :class="
      cn(
        'relative shrink-0 overflow-clip border-line bg-surface',
        side === 'left' ? 'border-r' : 'border-l',
        !open && 'border-transparent',
        !drag && 'transition-[width] duration-(--hn-duration-base) ease-(--hn-ease-move)',
      )
    "
    :style="{ width: open ? `${width}px` : '0px' }"
  >
    <Stack gap="none" class="h-full min-h-0" :style="{ width: `${width}px` }">
      <slot />
    </Stack>
    <div
      v-if="open"
      role="separator"
      aria-orientation="vertical"
      tabindex="0"
      :aria-label="`调整${label}宽度`"
      :aria-valuenow="width"
      aria-valuemin="240"
      aria-valuemax="400"
      :class="
        cn(
          'absolute inset-y-0 z-10 w-1.5 cursor-col-resize touch-none hn-transition outline-none hover:bg-accent/40 focus-visible:bg-accent/40',
          side === 'left' ? 'right-0' : 'left-0',
          drag && 'bg-accent/40',
        )
      "
      @pointerdown="begin"
      @pointermove="follow"
      @pointerup="drag = null"
      @lostpointercapture="drag = null"
      @dblclick="shell.resize(side, null)"
      @keydown="step"
    />
  </Stack>
</template>
