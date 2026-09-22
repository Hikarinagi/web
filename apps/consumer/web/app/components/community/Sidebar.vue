<script setup lang="ts">
  import { ScrollArea, Space, Stack } from '@hina-ui/vue'
  import type { ComponentPublicInstance } from 'vue'

  defineProps<{ follow?: boolean; footer?: boolean }>()

  const BOTTOM_MARGIN = 24

  const host = ref<ComponentPublicInstance | HTMLElement | null>(null)
  const inner = ref<ComponentPublicInstance | HTMLElement | null>(null)
  const { height: sidebarH } = useElementSize(inner)
  const { height: viewportH } = useWindowSize()

  const mode = ref<'top' | 'down' | 'up'>('top')
  const freeY = ref(0)
  let maxTop = 88
  let lastY = 0
  let live = true

  const fits = computed(() => sidebarH.value + maxTop + BOTTOM_MARGIN <= viewportH.value)

  function flip(next: 'down' | 'up') {
    const innerEl = unrefElement(inner)
    const hostEl = unrefElement(host)
    if (!innerEl || !hostEl) return
    const hostRect = hostEl.getBoundingClientRect()
    const rect = innerEl.getBoundingClientRect()
    freeY.value = Math.max(0, Math.min(rect.top - hostRect.top, hostRect.height - rect.height))
    mode.value = next
  }

  function onScroll() {
    if (!live || fits.value) return
    const y = window.scrollY
    if (y === lastY) return
    const down = y > lastY
    lastY = y
    if (down && mode.value !== 'down') flip('down')
    else if (!down && mode.value === 'down') flip('up')
  }
  useEventListener(window, 'scroll', onScroll, { passive: true })

  onMounted(() => {
    const innerEl = unrefElement(inner)
    if (innerEl) maxTop = parseFloat(getComputedStyle(innerEl).top) || maxTop
    lastY = window.scrollY
  })
  onActivated(() => {
    live = true
    lastY = window.scrollY
  })
  onDeactivated(() => {
    live = false
  })

  watch(fits, value => {
    if (value) {
      mode.value = 'top'
      freeY.value = 0
    }
  })

  const spacerStyle = computed(() => ({
    height: mode.value === 'top' || fits.value ? '0px' : `${freeY.value}px`,
  }))
  const innerStyle = computed(() => {
    if (!fits.value && mode.value === 'down')
      return { top: `${viewportH.value - sidebarH.value - BOTTOM_MARGIN}px` }
    if (!fits.value && mode.value === 'up')
      return { bottom: `${viewportH.value - maxTop - sidebarH.value}px` }
    return { top: 'calc(var(--app-header-height) + 1.5rem)' }
  })
</script>

<template>
  <Stack
    ref="host"
    as="aside"
    gap="none"
    class="relative hidden w-90 shrink-0"
    :style="follow && sidebarH ? { minHeight: `${sidebarH}px` } : undefined"
  >
    <template v-if="follow">
      <Space size="xs" class="w-full" :style="spacerStyle" />
      <Stack ref="inner" gap="none" class="sticky" :style="innerStyle">
        <slot />
        <LayoutSidebarFooter v-if="footer" class="my-4" />
      </Stack>
    </template>
    <Stack
      v-else
      gap="none"
      class="sticky top-[calc(var(--app-header-height)+1.5rem)] h-[calc(100dvh-var(--app-header-height)-3rem)]"
    >
      <ScrollArea class="min-h-0">
        <slot />
      </ScrollArea>
      <LayoutSidebarFooter v-if="footer" class="mt-4 shrink-0" />
    </Stack>
  </Stack>
</template>
