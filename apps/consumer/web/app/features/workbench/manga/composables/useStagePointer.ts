import { boundsOf, rectFrom, shift, type Point } from '../geometry'

type Shape = { vertices: Point[]; x: number; y: number }

export function useStagePointer(options: {
  surface: Readonly<Ref<SVGSVGElement | null>>
  tool: MaybeRefOrGetter<'select' | 'box' | 'point'>
  editable: MaybeRefOrGetter<boolean>
  shapeOf: (id: string) => Shape | null
  onSelect: (id: string | null) => void
  onCreate: (shape: Shape) => void
  onChange: (id: string, shape: Shape) => void
}) {
  const preview = ref<(Shape & { id: string }) | null>(null)
  const draft = ref<Shape | null>(null)
  let drag:
    | { mode: 'move'; id: string; start: Point; origin: Shape }
    | { mode: 'resize'; id: string; anchor: Point }
    | { mode: 'draw'; start: Point }
    | null = null

  function pointOf(event: PointerEvent): Point {
    const rect = options.surface.value?.getBoundingClientRect()
    if (!rect?.width || !rect.height) return [0, 0]
    return [
      Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width)),
      Math.min(1, Math.max(0, (event.clientY - rect.top) / rect.height)),
    ]
  }

  function onPointerDown(event: PointerEvent) {
    if (event.button !== 0) return
    const target = event.target as Element
    const id = target.closest('[data-region-id]')?.getAttribute('data-region-id') ?? null
    const point = pointOf(event)
    const editable = toValue(options.editable)
    if (id) {
      options.onSelect(id)
      const origin = options.shapeOf(id)
      if (!editable || !origin) return
      if (target.closest('[data-handle="resize"]')) {
        const bounds = boundsOf(origin.vertices, origin.x, origin.y)
        drag = { mode: 'resize', id, anchor: [bounds.x0, bounds.y0] }
      } else if (toValue(options.tool) === 'select') {
        drag = { mode: 'move', id, start: point, origin }
      }
    } else if (editable && toValue(options.tool) === 'box') {
      drag = { mode: 'draw', start: point }
      draft.value = rectFrom(point, point)
    } else if (editable && toValue(options.tool) === 'point') {
      options.onCreate({ vertices: [], x: point[0], y: point[1] })
    } else {
      options.onSelect(null)
    }
    if (drag) options.surface.value?.setPointerCapture(event.pointerId)
  }

  function onPointerMove(event: PointerEvent) {
    if (!drag) return
    const point = pointOf(event)
    if (drag.mode === 'draw') {
      draft.value = rectFrom(drag.start, point)
    } else if (drag.mode === 'resize') {
      preview.value = { id: drag.id, ...rectFrom(drag.anchor, point) }
    } else {
      preview.value = {
        id: drag.id,
        ...shift(
          drag.origin.vertices,
          drag.origin.x,
          drag.origin.y,
          point[0] - drag.start[0],
          point[1] - drag.start[1],
        ),
      }
    }
  }

  function onPointerUp(event: PointerEvent) {
    if (!drag) return
    options.surface.value?.releasePointerCapture(event.pointerId)
    if (drag.mode === 'draw' && draft.value) {
      const bounds = boundsOf(draft.value.vertices, draft.value.x, draft.value.y)
      if (bounds.x1 - bounds.x0 > 0.01 && bounds.y1 - bounds.y0 > 0.005) {
        options.onCreate(draft.value)
      }
    } else if (preview.value) {
      const { id, ...shape } = preview.value
      options.onChange(id, shape)
    }
    drag = null
    draft.value = null
    preview.value = null
  }

  return { preview, draft, onPointerDown, onPointerMove, onPointerUp }
}
