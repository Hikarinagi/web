import type { EditorView } from '@tiptap/pm/view'

const ENTER_CLASS = 'hikari-block-entering'
const ENTER_MS = 220

export function revealBlock(view: EditorView, pos: number): void {
  const dom = view.nodeDOM(pos)
  if (!(dom instanceof HTMLElement)) return

  const height = dom.getBoundingClientRect().height
  if (height <= 0) return

  dom.classList.add(ENTER_CLASS)
  dom.style.height = '0px'
  dom.style.opacity = '0'

  requestAnimationFrame(() => {
    dom.style.height = `${height}px`
    dom.style.opacity = '1'

    let settled = false
    const done = () => {
      if (settled) return
      settled = true
      dom.removeEventListener('transitionend', done)
      dom.classList.remove(ENTER_CLASS)
      dom.style.height = ''
      dom.style.opacity = ''
    }
    dom.addEventListener('transitionend', done)
    setTimeout(done, ENTER_MS + 80)
  })
}
