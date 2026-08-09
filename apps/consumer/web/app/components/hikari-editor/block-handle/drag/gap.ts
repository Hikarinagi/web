import { Plugin, PluginKey } from '@tiptap/pm/state'
import { Decoration, DecorationSet } from '@tiptap/pm/view'
import type { EditorView } from '@tiptap/pm/view'

export interface GapState {
  sourcePos: number
  dropPos: number
  height: number
}

export const gapKey = new PluginKey<GapState | null>('hikariBlockGap')

export function gapDecorations(doc: Parameters<typeof DecorationSet.create>[0], gap: GapState) {
  const shift = Math.round(gap.height)
  const decorations: Decoration[] = []

  doc.forEach((node, offset) => {
    const end = offset + node.nodeSize
    if (offset === gap.sourcePos) {
      decorations.push(Decoration.node(offset, end, { class: 'hikari-block-collapsing' }))
      return
    }

    if (offset >= gap.dropPos) {
      decorations.push(Decoration.node(offset, end, { style: `transform: translateY(${shift}px)` }))
    }
  })

  return decorations
}

export function gapPlugin() {
  return new Plugin<GapState | null>({
    key: gapKey,
    state: {
      init: () => null,
      apply(tr, value) {
        const meta = tr.getMeta(gapKey) as GapState | null | undefined
        return meta === undefined ? value : meta
      },
    },
    props: {
      decorations(state) {
        const gap = gapKey.getState(state)
        if (!gap) return null
        return DecorationSet.create(state.doc, gapDecorations(state.doc, gap))
      },
    },
  })
}

export function setGap(view: EditorView, gap: GapState | null): void {
  view.dom.classList.toggle('hikari-blocks-shifting', gap !== null)
  view.dispatch(view.state.tr.setMeta(gapKey, gap))
}

export function collapseSource(view: EditorView, pos: number): () => void {
  const dom = view.nodeDOM(pos)
  if (!(dom instanceof HTMLElement)) return () => {}

  dom.style.height = `${dom.getBoundingClientRect().height}px`
  const frame = requestAnimationFrame(() => {
    dom.style.height = '0px'
  })

  return () => {
    cancelAnimationFrame(frame)
    dom.style.height = ''
  }
}
