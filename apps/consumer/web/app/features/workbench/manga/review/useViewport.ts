import type { ShallowRef } from 'vue'
import type { MangaNoteRect } from '../manga'
import type { ReviewZoom } from './useReviewState'

export interface NoteAnchor {
  getBoundingClientRect: () => DOMRect
  contextElement?: Element
}

const clamp = (value: number) => Math.min(Math.max(value, 0), 1)

export function useViewport(input: {
  container: Readonly<ShallowRef<HTMLElement | null>>
  frame: Readonly<ShallowRef<HTMLElement | null>>
  size: () => { width: number; height: number }
  zoom: () => ReviewZoom
  center: Ref<{ x: number; y: number }>
  drawing: () => boolean
  onDraw: (rect: MangaNoteRect, anchor: NoteAnchor) => void
}) {
  const { width: viewWidth, height: viewHeight } = useElementSize(input.container)
  const draft = ref<MangaNoteRect | null>(null)

  const box = computed(() => {
    const { width, height } = input.size()
    if (!width || !height || !viewWidth.value || !viewHeight.value) {
      return { width: 0, height: 0, left: 0, top: 0 }
    }
    const zoom = input.zoom()
    const scale =
      zoom === 'fit' ? Math.min(viewWidth.value / width, viewHeight.value / height) : zoom
    const place = (view: number, size: number, at: number) =>
      size <= view ? (view - size) / 2 : Math.min(0, Math.max(view - size, view / 2 - at * size))
    return {
      width: width * scale,
      height: height * scale,
      left: place(viewWidth.value, width * scale, input.center.value.x),
      top: place(viewHeight.value, height * scale, input.center.value.y),
    }
  })
  const pannable = computed(
    () => box.value.width > viewWidth.value || box.value.height > viewHeight.value,
  )

  let pan: { x: number; y: number; center: { x: number; y: number } } | null = null
  let origin: { x: number; y: number } | null = null

  const pointOf = (event: PointerEvent) => {
    const frame = input.frame.value?.getBoundingClientRect()
    if (!frame?.width || !frame.height) return { x: 0, y: 0 }
    return {
      x: clamp((event.clientX - frame.left) / frame.width),
      y: clamp((event.clientY - frame.top) / frame.height),
    }
  }

  function anchorOf(rect: MangaNoteRect): NoteAnchor {
    return {
      getBoundingClientRect: () => {
        const frame = input.frame.value?.getBoundingClientRect()
        if (!frame) return new DOMRect()
        return new DOMRect(
          frame.left + rect.x * frame.width,
          frame.top + rect.y * frame.height,
          rect.w * frame.width,
          rect.h * frame.height,
        )
      },
      contextElement: input.frame.value ?? undefined,
    }
  }

  function onPointerDown(event: PointerEvent) {
    if (event.button !== 0) return
    if (input.drawing()) {
      origin = pointOf(event)
      draft.value = { ...origin, w: 0, h: 0 }
    } else if (pannable.value) {
      pan = { x: event.clientX, y: event.clientY, center: { ...input.center.value } }
    } else {
      return
    }
    ;(event.currentTarget as Element).setPointerCapture(event.pointerId)
  }

  function onPointerMove(event: PointerEvent) {
    if (origin) {
      const point = pointOf(event)
      draft.value = {
        x: Math.min(origin.x, point.x),
        y: Math.min(origin.y, point.y),
        w: Math.abs(point.x - origin.x),
        h: Math.abs(point.y - origin.y),
      }
    } else if (pan && box.value.width && box.value.height) {
      input.center.value = {
        x: clamp(pan.center.x - (event.clientX - pan.x) / box.value.width),
        y: clamp(pan.center.y - (event.clientY - pan.y) / box.value.height),
      }
    }
  }

  function onPointerUp() {
    if (origin && draft.value) {
      const rect =
        draft.value.w < 0.01 && draft.value.h < 0.01 ? { ...draft.value, w: 0, h: 0 } : draft.value
      input.onDraw(rect, anchorOf(rect))
    }
    origin = null
    pan = null
    draft.value = null
  }

  return { box, pannable, draft, onPointerDown, onPointerMove, onPointerUp }
}
