import { useMutationObserver, useResizeObserver, useScroll } from '@vueuse/core'
import { computed, ref, watch, type ComputedRef, type Ref } from 'vue'

interface ShadowState {
  showTop: ComputedRef<boolean>
  showBottom: ComputedRef<boolean>
  showLeft: ComputedRef<boolean>
  showRight: ComputedRef<boolean>
}

const EDGE_TOLERANCE = 1

export function useScrollShadow(target: Ref<HTMLElement | null>): ShadowState {
  const { x, y } = useScroll(target, { throttle: 50 })

  const scrollHeight = ref(0)
  const clientHeight = ref(0)
  const scrollWidth = ref(0)
  const clientWidth = ref(0)

  function measure() {
    const el = target.value
    if (!el) return
    scrollHeight.value = el.scrollHeight
    clientHeight.value = el.clientHeight
    scrollWidth.value = el.scrollWidth
    clientWidth.value = el.clientWidth
  }

  useResizeObserver(target, measure)
  useMutationObserver(target, measure, {
    subtree: true,
    childList: true,
    characterData: true,
    attributes: true,
  })
  watch(target, measure, { immediate: true, flush: 'post' })

  const showTop = computed(() => y.value > EDGE_TOLERANCE)
  const showBottom = computed(() => {
    const max = scrollHeight.value - clientHeight.value
    return max > 0 && y.value < max - EDGE_TOLERANCE
  })
  const showLeft = computed(() => x.value > EDGE_TOLERANCE)
  const showRight = computed(() => {
    const max = scrollWidth.value - clientWidth.value
    return max > 0 && x.value < max - EDGE_TOLERANCE
  })

  return { showTop, showBottom, showLeft, showRight }
}
