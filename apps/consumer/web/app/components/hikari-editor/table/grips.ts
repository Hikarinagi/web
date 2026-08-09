import type { Node as PMNode } from '@tiptap/pm/model'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { TableMap, cellAround } from '@tiptap/pm/tables'
import { Decoration, DecorationSet, type EditorView } from '@tiptap/pm/view'
import type { TableAxis } from './commands'

export interface GripPress {
  axis: TableAxis
  index: number
  pos: number
  el: HTMLElement
}

export interface HotCell {
  table: number
  row: number
  col: number
}

export const gripsKey = new PluginKey<HotCell | null>('hikariTableGrips')

export function hotCellAt(view: EditorView, target: EventTarget | null): HotCell | null {
  const el = target instanceof Element ? target.closest('td, th') : null
  if (!el || !view.dom.contains(el)) return null
  const pos = view.posAtDOM(el, 0)
  if (pos < 0) return null
  const $cell = cellAround(view.state.doc.resolve(pos))
  if (!$cell) return null
  const start = $cell.start(-1)
  const rect = TableMap.get($cell.node(-1)).findCell($cell.pos - start)
  return { table: start, row: rect.top, col: rect.left }
}

export function sameCell(a: HotCell | null, b: HotCell | null): boolean {
  if (!a || !b) return a === b
  return a.table === b.table && a.row === b.row && a.col === b.col
}

function gripFor(
  axis: TableAxis,
  index: number,
  pos: number,
  hot: boolean,
  onPress: (press: GripPress) => void,
) {
  return () => {
    const el = document.createElement('div')
    el.className = `hikari-table-grip is-${axis}`
    el.dataset.hot = String(hot)
    el.setAttribute('role', 'button')
    el.setAttribute('aria-label', axis === 'column' ? '选中该列' : '选中该行')
    el.addEventListener('mousedown', event => {
      event.preventDefault()
      event.stopPropagation()
      onPress({ axis, index, pos, el })
    })
    return el
  }
}

function decorate(doc: PMNode, hot: HotCell | null, onPress: (press: GripPress) => void) {
  const decorations: Decoration[] = []

  doc.descendants((node, pos) => {
    if (node.type.name !== 'table') return true
    const map = TableMap.get(node)
    const start = pos + 1
    const live = hot?.table === start

    for (let col = 0; col < map.width; col++) {
      const offset = map.map[col]
      if (offset === undefined || map.findCell(offset).left !== col) continue
      const on = live && hot.col === col
      decorations.push(
        Decoration.widget(start + offset + 1, gripFor('column', col, pos, on, onPress), {
          key: `col-${col}-${on}`,
          side: -1,
          marks: [],
        }),
      )
    }

    for (let row = 0; row < map.height; row++) {
      const offset = map.map[row * map.width]
      if (offset === undefined || map.findCell(offset).top !== row) continue
      const on = live && hot.row === row
      decorations.push(
        Decoration.widget(start + offset + 1, gripFor('row', row, pos, on, onPress), {
          key: `row-${row}-${on}`,
          side: -1,
          marks: [],
        }),
      )
    }
    return false
  })

  return decorations
}

export function gripsPlugin(onPress: (press: GripPress) => void) {
  return new Plugin<HotCell | null>({
    key: gripsKey,
    state: {
      init: () => null,
      apply(tr, value) {
        const meta = tr.getMeta(gripsKey) as HotCell | null | undefined
        return meta === undefined ? value : meta
      },
    },
    props: {
      decorations(state) {
        return DecorationSet.create(
          state.doc,
          decorate(state.doc, gripsKey.getState(state) ?? null, onPress),
        )
      },
      handleDOMEvents: {
        mousemove(view, event) {
          const next = hotCellAt(view, event.target)
          if (sameCell(next, gripsKey.getState(view.state) ?? null)) return false
          view.dispatch(view.state.tr.setMeta(gripsKey, next))
          return false
        },
        mouseleave(view) {
          if (gripsKey.getState(view.state)) view.dispatch(view.state.tr.setMeta(gripsKey, null))
          return false
        },
      },
    },
  })
}
