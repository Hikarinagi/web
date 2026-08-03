const MIN_ZOOM = 0.5
const MAX_ZOOM = 4

export function useDiagramViewport(
  frame: Ref<HTMLElement | null>,
  size: () => { width: number; height: number },
) {
  const zoom = ref(1)
  const panX = ref(0)
  const panY = ref(0)
  const dragging = ref(false)

  const transform = computed(() => {
    const { width, height } = size()
    const cx = width / 2
    const cy = height / 2
    return `translate(${panX.value} ${panY.value}) translate(${cx} ${cy}) scale(${zoom.value}) translate(${-cx} ${-cy})`
  })

  function reset() {
    zoom.value = 1
    panX.value = 0
    panY.value = 0
  }

  function fitScale() {
    const box = frame.value?.getBoundingClientRect()
    const { width, height } = size()
    if (!box || !width || !height) return 1
    return Math.min(box.width / width, box.height / height)
  }

  function zoomBy(factor: number, clientX?: number, clientY?: number) {
    const next = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoom.value * factor))
    if (next === zoom.value) return

    const box = frame.value?.getBoundingClientRect()
    const { width, height } = size()
    if (box && clientX !== undefined && clientY !== undefined) {
      const scale = fitScale()
      const anchorX = (clientX - box.left - (box.width - width * scale) / 2) / scale
      const anchorY = (clientY - box.top - (box.height - height * scale) / 2) / scale
      const cx = width / 2
      const cy = height / 2
      const ratio = next / zoom.value
      panX.value = anchorX - cx - ratio * (anchorX - panX.value - cx)
      panY.value = anchorY - cy - ratio * (anchorY - panY.value - cy)
    }
    zoom.value = next
  }

  let originX = 0
  let originY = 0

  useEventListener(frame, 'wheel', (event: WheelEvent) => {
    event.preventDefault()
    zoomBy(event.deltaY < 0 ? 1.12 : 1 / 1.12, event.clientX, event.clientY)
  })

  useEventListener(frame, 'pointerdown', (event: PointerEvent) => {
    if ((event.target as HTMLElement | null)?.closest('button')) return
    dragging.value = true
    const scale = fitScale()
    originX = event.clientX / scale - panX.value
    originY = event.clientY / scale - panY.value
    ;(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId)
  })

  useEventListener(frame, 'pointermove', (event: PointerEvent) => {
    if (!dragging.value) return
    const scale = fitScale()
    panX.value = event.clientX / scale - originX
    panY.value = event.clientY / scale - originY
  })

  useEventListener(frame, 'pointerup', () => (dragging.value = false))
  useEventListener(frame, 'pointercancel', () => (dragging.value = false))

  useEventListener(frame, 'keydown', (event: KeyboardEvent) => {
    const step = 32
    const moves: Record<string, () => void> = {
      ArrowUp: () => (panY.value += step),
      ArrowDown: () => (panY.value -= step),
      ArrowLeft: () => (panX.value += step),
      ArrowRight: () => (panX.value -= step),
      '=': () => zoomBy(1.2),
      '+': () => zoomBy(1.2),
      '-': () => zoomBy(1 / 1.2),
      '0': reset,
    }
    const move = moves[event.key]
    if (!move) return
    event.preventDefault()
    move()
  })

  return { transform, dragging, zoomBy, reset }
}
