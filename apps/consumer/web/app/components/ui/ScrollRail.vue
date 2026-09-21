<script setup lang="ts">
  import { IconButton, ScrollArea, Stack } from '@hina-ui/vue'
  import { ChevronLeft, ChevronRight } from '@lucide/vue'
  import type { ComponentPublicInstance } from 'vue'
  import { cn } from '~/utils/cn'

  defineOptions({ name: 'HikariScrollRail' })

  const scroller = useTemplateRef<ComponentPublicInstance & { viewport?: HTMLElement }>('scroller')
  const viewport = computed(() => scroller.value?.viewport ?? null)
  const content = computed(() => (viewport.value?.firstElementChild as HTMLElement) ?? null)

  const canScrollStart = ref(false)
  const canScrollEnd = ref(false)

  function measure() {
    const el = viewport.value
    if (!el) {
      canScrollStart.value = false
      canScrollEnd.value = false
      return
    }
    const max = el.scrollWidth - el.clientWidth
    canScrollStart.value = el.scrollLeft > 1
    canScrollEnd.value = max > 1 && el.scrollLeft < max - 1
  }

  useEventListener(viewport, 'scroll', measure, { passive: true })
  useResizeObserver(viewport, measure)
  useResizeObserver(content, measure)
  watch(viewport, () => nextTick(measure), { immediate: true })

  function page(dir: 1 | -1) {
    const el = viewport.value
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: 'smooth' })
  }

  const ARROW_SLOT = cn(
    'pointer-events-none absolute top-1/2 z-10 hidden -translate-y-1/2',
    'opacity-0 transition-opacity duration-200 ease-out [@media(hover:hover)]:block',
  )
  const ARROW_VISIBLE = 'group-hover/rail:pointer-events-auto group-hover/rail:opacity-100'
  const ARROW_BUTTON = 'bg-surface/90 shadow-md backdrop-blur hover:bg-surface'
</script>

<template>
  <Stack gap="none" class="group/rail relative min-w-0">
    <ScrollArea ref="scroller" :wheel-redirect="false" direction="horizontal">
      <slot />
    </ScrollArea>

    <Stack
      gap="none"
      :inert="!canScrollStart"
      :class="cn(ARROW_SLOT, 'start-3', canScrollStart && ARROW_VISIBLE)"
    >
      <IconButton
        pill
        variant="ghost"
        tone="neutral"
        label="向左滚动"
        :tooltip="false"
        :class="ARROW_BUTTON"
        @click="page(-1)"
      >
        <ChevronLeft />
      </IconButton>
    </Stack>

    <Stack
      gap="none"
      :inert="!canScrollEnd"
      :class="cn(ARROW_SLOT, 'end-3', canScrollEnd && ARROW_VISIBLE)"
    >
      <IconButton
        pill
        variant="ghost"
        tone="neutral"
        label="向右滚动"
        :tooltip="false"
        :class="ARROW_BUTTON"
        @click="page(1)"
      >
        <ChevronRight />
      </IconButton>
    </Stack>
  </Stack>
</template>
