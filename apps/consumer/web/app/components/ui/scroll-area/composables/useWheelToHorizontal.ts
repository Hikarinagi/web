import { useEventListener, useMediaQuery } from '@vueuse/core'
import { toValue, type MaybeRefOrGetter, type Ref } from 'vue'

const EDGE_TOLERANCE = 1

export function useWheelToHorizontal(
  target: Ref<HTMLElement | null>,
  enabled: MaybeRefOrGetter<boolean>,
) {
  const finePointer = useMediaQuery('(any-pointer: fine)')
  useEventListener(
    () => (toValue(enabled) && finePointer.value ? target.value : null),
    'wheel',
    (event: WheelEvent) => {
      const el = target.value
      if (!el || event.deltaX !== 0) return

      const max = el.scrollWidth - el.clientWidth
      if (max <= 0) return

      const delta = event.deltaY
      if (delta === 0) return
      if (delta < 0 && el.scrollLeft <= EDGE_TOLERANCE) return
      if (delta > 0 && el.scrollLeft >= max - EDGE_TOLERANCE) return

      const factor = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? el.clientWidth : 1
      event.preventDefault()
      el.scrollLeft += delta * factor
    },
    { passive: false },
  )
}
