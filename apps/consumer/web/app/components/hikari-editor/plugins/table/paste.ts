import { Fragment, Slice, type Node as PMNode, type Schema } from '@tiptap/pm/model'
import { Plugin, PluginKey, type EditorState } from '@tiptap/pm/state'

const CELL_TYPES = new Set(['table_cell', 'table_header'])

export function isInCell(state: EditorState): boolean {
  const { $from } = state.selection
  for (let depth = $from.depth; depth > 0; depth--) {
    if (CELL_TYPES.has($from.node(depth).type.name)) return true
  }
  return false
}

function containsTable(fragment: Fragment): boolean {
  let found = false
  fragment.forEach(node => {
    if (found) return
    found = node.type.name === 'table' || containsTable(node.content)
  })
  return found
}

export function flattenToParagraphs(slice: Slice, schema: Schema): Slice {
  const paragraph = schema.nodes.paragraph
  if (!paragraph || containsTable(slice.content)) return slice

  const out: PMNode[] = []
  let changed = false

  const visit = (node: PMNode) => {
    if (node.isTextblock) {
      if (node.type === paragraph) {
        out.push(node)
        return
      }
      changed = true
      out.push(paragraph.create(null, node.content))
      return
    }
    if (node.isBlock) {
      changed = true
      node.content.forEach(visit)
      return
    }
    out.push(node)
  }

  slice.content.forEach(visit)
  return changed ? new Slice(Fragment.from(out), 0, 0) : slice
}

export function cellPastePlugin() {
  return new Plugin({
    key: new PluginKey('hikariTableCellPaste'),
    props: {
      transformPasted: (slice, view) =>
        isInCell(view.state) ? flattenToParagraphs(slice, view.state.schema) : slice,
    },
  })
}
