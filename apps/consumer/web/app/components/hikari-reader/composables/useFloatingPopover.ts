import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
  type ComponentPublicInstance,
  type Ref,
} from 'vue'

type FloatingPlacement = 'above' | 'below'

interface FloatingSize {
  width: number
  height: number
}

interface UseFloatingPopoverOptions {
  anchor: Ref<{ x: number; y: number }>
  fallbackSize: FloatingSize
  gap?: number
  margin?: number
}

type FloatingTarget = ComponentPublicInstance | Element | null

function clamp(value: number, min: number, max: number) {
  if (max < min) return min
  return Math.min(Math.max(value, min), max)
}

function viewportSize(): FloatingSize {
  if (!import.meta.client) return { width: 1024, height: 768 }
  return { width: window.innerWidth, height: window.innerHeight }
}

function toElement(target: FloatingTarget) {
  if (!import.meta.client) return null
  if (target instanceof Element) {
    return target instanceof HTMLElement ? target : null
  }

  const element = target?.$el
  return element instanceof HTMLElement ? element : null
}

export function useFloatingPopover(options: UseFloatingPopoverOptions) {
  const target = ref<FloatingTarget>(null)
  const size = ref<FloatingSize>(options.fallbackSize)
  const viewport = ref<FloatingSize>(viewportSize())
  let observer: ResizeObserver | null = null

  function measure() {
    if (!import.meta.client) return
    viewport.value = viewportSize()

    const element = toElement(target.value)
    if (!element) return
    const width = element.offsetWidth
    const height = element.offsetHeight
    if (width > 0 && height > 0) size.value = { width, height }
  }

  function observe() {
    observer?.disconnect()
    observer = null
    const element = toElement(target.value)
    if (!import.meta.client || !element) return

    observer = new ResizeObserver(measure)
    observer.observe(element)
    measure()
  }

  onMounted(() => {
    void nextTick(observe)
    window.addEventListener('resize', measure)
  })

  watch(target, () => {
    void nextTick(observe)
  })

  watch(
    () => [options.anchor.value.x, options.anchor.value.y],
    () => {
      void nextTick(measure)
    },
  )

  onBeforeUnmount(() => {
    observer?.disconnect()
    if (import.meta.client) window.removeEventListener('resize', measure)
  })

  const position = computed(() => {
    const margin = options.margin ?? 12
    const gap = options.gap ?? 12
    const width = Math.min(size.value.width, Math.max(0, viewport.value.width - margin * 2))
    const height = Math.min(size.value.height, Math.max(0, viewport.value.height - margin * 2))
    const maxLeft = Math.max(margin, viewport.value.width - margin - width)
    const maxTop = Math.max(margin, viewport.value.height - margin - height)
    const roomAbove = options.anchor.value.y - margin - gap
    const roomBelow = viewport.value.height - options.anchor.value.y - margin - gap
    const placement: FloatingPlacement =
      roomAbove < height && roomBelow > roomAbove ? 'below' : 'above'
    const top =
      placement === 'below' ? options.anchor.value.y + gap : options.anchor.value.y - gap - height

    return {
      left: clamp(options.anchor.value.x - width / 2, margin, maxLeft),
      top: clamp(top, margin, maxTop),
      placement,
    }
  })

  const style = computed(() => ({
    left: `${position.value.left}px`,
    top: `${position.value.top}px`,
    transformOrigin: position.value.placement === 'below' ? '50% 0%' : '50% 100%',
  }))

  const placement = computed(() => position.value.placement)

  return { placement, style, target }
}
