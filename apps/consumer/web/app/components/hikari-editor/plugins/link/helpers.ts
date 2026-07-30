import type { Editor } from '@tiptap/core'

export function readLinkContext(editor: Editor): { initialUrl?: string; selectedText: string } {
  const { from, to } = editor.state.selection
  const selectedText = editor.state.doc.textBetween(from, to, ' ')
  let initialUrl: string | undefined
  editor.state.doc.nodesBetween(from, to, node => {
    const linkMark = node.marks.find(m => m.type.name === 'link')
    if (linkMark) initialUrl = linkMark.attrs.href as string
  })
  return { initialUrl, selectedText }
}

let selectionAnchorEl: HTMLElement | null = null

export function getSelectionAnchor(editor: Editor): HTMLElement {
  const { from, to } = editor.state.selection
  const start = editor.view.coordsAtPos(from)
  const end = editor.view.coordsAtPos(to)
  const sameLine = Math.abs(end.top - start.top) < 1
  if (!selectionAnchorEl) {
    selectionAnchorEl = document.createElement('span')
    selectionAnchorEl.style.cssText = 'position:fixed;pointer-events:none;visibility:hidden;'
    document.body.appendChild(selectionAnchorEl)
  }
  Object.assign(selectionAnchorEl.style, {
    left: `${start.left}px`,
    top: `${start.top}px`,
    width: `${sameLine ? Math.max(1, end.right - start.left) : 1}px`,
    height: `${start.bottom - start.top}px`,
  })
  return selectionAnchorEl
}
