import type { MaybeElementRef } from '@vueuse/core'

export function useOverflowing(target: MaybeElementRef) {
  const overflowing = ref(false)

  function measure() {
    const el = unrefElement(target)
    overflowing.value = !!el && el.scrollWidth > el.clientWidth
  }

  useResizeObserver(target, measure)
  onMounted(measure)
  onUpdated(measure)

  return overflowing
}
