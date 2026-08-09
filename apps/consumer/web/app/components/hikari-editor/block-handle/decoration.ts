import { Plugin, PluginKey } from '@tiptap/pm/state'
import { Decoration, DecorationSet } from '@tiptap/pm/view'

export interface BlockDecoration {
  pos: number
  cls: string
}

export const blockDecorationKey = new PluginKey<BlockDecoration | null>('hikariBlockDecoration')

export function blockDecorationPlugin() {
  return new Plugin<BlockDecoration | null>({
    key: blockDecorationKey,
    state: {
      init: () => null,
      apply(tr, value) {
        const meta = tr.getMeta(blockDecorationKey) as BlockDecoration | null | undefined
        if (meta !== undefined) return meta
        if (!value || !tr.docChanged) return value
        return { ...value, pos: tr.mapping.map(value.pos) }
      },
    },
    props: {
      decorations(state) {
        const value = blockDecorationKey.getState(state)
        if (!value) return null
        const node = state.doc.nodeAt(value.pos)
        if (!node) return null
        return DecorationSet.create(state.doc, [
          Decoration.node(value.pos, value.pos + node.nodeSize, { class: value.cls }),
        ])
      },
    },
  })
}
