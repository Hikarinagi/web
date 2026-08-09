import type { EditorView } from '@tiptap/pm/view'

export interface DropTarget {
  pos: number
  top: number
  left: number
  width: number
}

export interface BlockBox {
  pos: number
  end: number
  top: number
  bottom: number
  left: number
  width: number
}

export function measureBlocks(view: EditorView): BlockBox[] {
  const boxes: BlockBox[] = []
  view.state.doc.forEach((node, offset) => {
    const dom = view.nodeDOM(offset)
    if (!(dom instanceof HTMLElement)) return
    const rect = dom.getBoundingClientRect()
    boxes.push({
      pos: offset,
      end: offset + node.nodeSize,
      top: rect.top,
      bottom: rect.bottom,
      left: rect.left,
      width: rect.width,
    })
  })
  return boxes
}

export function dropTargetIn(boxes: BlockBox[], clientY: number): DropTarget | null {
  const first = boxes[0]
  if (!first) return null

  if (clientY < first.top + (first.bottom - first.top) / 2) {
    return { pos: first.pos, top: first.top, left: first.left, width: first.width }
  }

  let target = first
  for (const box of boxes) {
    if (clientY >= box.top + (box.bottom - box.top) / 2) target = box
  }
  return { pos: target.end, top: target.bottom, left: target.left, width: target.width }
}
