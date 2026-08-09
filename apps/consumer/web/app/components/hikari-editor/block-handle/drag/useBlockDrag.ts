import type { Editor } from '@tiptap/vue-3'
import { ref, shallowRef } from 'vue'
import { moveBlock } from '../commands'
import { collapseSource, setGap } from './gap'
import { createDragPreview, type DragPreview } from './preview'
import { measureBlocks, dropTargetIn, type BlockBox, type DropTarget } from './target'

const START_THRESHOLD_PX = 4

export function useBlockDrag(
  editor: () => Editor | null,
  targetPos: () => number | null,
  onTap?: (event: PointerEvent) => void,
  onDropped?: (pos: number) => void,
) {
  const dragging = ref(false)
  const indicator = shallowRef<DropTarget | null>(null)

  let preview: DragPreview | null = null
  let from = -1
  let origin = { x: 0, y: 0 }
  let pointerId = -1
  let grip: HTMLElement | null = null
  let settling = false
  let boxes: BlockBox[] = []
  let appliedDrop = -1
  let restoreSource: (() => void) | null = null

  function detach() {
    if (grip && pointerId !== -1 && grip.hasPointerCapture(pointerId)) {
      grip.releasePointerCapture(pointerId)
    }
    grip = null
    pointerId = -1
    window.removeEventListener('pointermove', onMove)
    window.removeEventListener('pointerup', onUp)
    window.removeEventListener('pointercancel', onCancel)
    window.removeEventListener('keydown', onKey)
  }

  function reset() {
    const ed = editor()
    if (ed) setGap(ed.view, null)
    restoreSource?.()
    restoreSource = null
    boxes = []
    appliedDrop = -1
    preview?.destroy()
    preview = null
    indicator.value = null
    dragging.value = false
    settling = false
    from = -1
  }

  function reanchor(box: DOMRect) {
    const ed = editor()
    if (!ed) return
    ed.view.dom.dispatchEvent(
      new MouseEvent('mousemove', {
        bubbles: true,
        clientX: box.left + 1,
        clientY: box.top + Math.min(box.height / 2, 24),
      }),
    )
  }

  async function finish(box: DOMRect | null, moved = false) {
    if (preview && box) {
      settling = true
      indicator.value = null
      await preview.settleTo(box.left, box.top)
    }
    reset()
    if (box && moved) reanchor(box)
  }

  function onCancel() {
    detach()
    const ed = editor()
    if (!ed || !dragging.value || from === -1) {
      reset()
      return
    }
    setGap(ed.view, null)
    restoreSource?.()
    restoreSource = null
    const dom = ed.view.nodeDOM(from)
    void finish(dom instanceof HTMLElement ? dom.getBoundingClientRect() : null)
  }

  function onKey(event: KeyboardEvent) {
    if (event.key !== 'Escape') return
    event.preventDefault()
    onCancel()
  }

  function begin(event: PointerEvent) {
    const ed = editor()
    if (!ed || from === -1) return false
    const dom = ed.view.nodeDOM(from)
    if (!(dom instanceof HTMLElement)) return false

    boxes = measureBlocks(ed.view)
    preview = createDragPreview(dom, event.clientX, event.clientY)
    restoreSource = collapseSource(ed.view, from)
    appliedDrop = -1
    dragging.value = true
    return true
  }

  function onMove(event: PointerEvent) {
    const ed = editor()
    if (!ed || settling) return

    if (!dragging.value) {
      if (Math.hypot(event.clientX - origin.x, event.clientY - origin.y) < START_THRESHOLD_PX)
        return
      if (!begin(event)) {
        detach()
        reset()
        return
      }
    }

    preview?.moveTo(event.clientX, event.clientY)
    const drop = dropTargetIn(boxes, event.clientY)
    if (drop?.pos !== indicator.value?.pos) indicator.value = drop
    if (drop && drop.pos !== appliedDrop) {
      appliedDrop = drop.pos
      setGap(ed.view, { sourcePos: from, dropPos: drop.pos, height: preview?.height ?? 0 })
    }
  }

  function onUp(event: PointerEvent) {
    detach()
    const ed = editor()
    const to = indicator.value?.pos ?? null
    const start = from
    const tapped = !dragging.value

    if (!ed || !dragging.value || to === null || start === -1) {
      void finish(null)
      if (tapped) onTap?.(event)
      return
    }

    setGap(ed.view, null)
    restoreSource?.()
    restoreSource = null

    const landed = moveBlock(ed, start, to)
    if (landed !== null) onDropped?.(landed)

    const dom = ed.view.nodeDOM(landed ?? start)
    const box = dom instanceof HTMLElement ? dom.getBoundingClientRect() : null
    void finish(box, landed !== null)
  }

  function onPointerDown(event: PointerEvent) {
    if (event.button !== 0 || settling) return
    const pos = targetPos()
    if (pos === null) return

    event.preventDefault()
    from = pos
    origin = { x: event.clientX, y: event.clientY }
    pointerId = event.pointerId
    grip = event.currentTarget instanceof HTMLElement ? event.currentTarget : null
    grip?.setPointerCapture(pointerId)

    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    window.addEventListener('pointercancel', onCancel)
    window.addEventListener('keydown', onKey)
  }

  return { dragging, indicator, onPointerDown }
}
