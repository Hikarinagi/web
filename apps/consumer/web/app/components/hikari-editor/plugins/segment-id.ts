import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import type { EditorPlugin } from './types'

const SEGMENT_NODES = ['paragraph', 'image_block', 'horizontal_rule']

const SegmentIdExtension = Extension.create({
  name: 'segment_id',
  addGlobalAttributes() {
    return [
      {
        types: SEGMENT_NODES,
        attributes: {
          segment_id: {
            default: null,
            keepOnSplit: false,
            parseHTML: element => element.getAttribute('data-segment-id'),
            renderHTML: attributes =>
              attributes.segment_id ? { 'data-segment-id': attributes.segment_id } : {},
          },
        },
      },
    ]
  },
  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('segment_id'),
        appendTransaction(transactions, _previous, state) {
          if (!transactions.some(transaction => transaction.docChanged)) return null
          const seen = new Set<string>()
          let tr = null
          state.doc.forEach((node, offset) => {
            if (!SEGMENT_NODES.includes(node.type.name)) return
            const id = node.attrs.segment_id as string | null
            if (id && !seen.has(id)) {
              seen.add(id)
              return
            }
            const next = crypto.randomUUID()
            seen.add(next)
            tr ??= state.tr
            tr.setNodeMarkup(offset, undefined, { ...node.attrs, segment_id: next })
          })
          return tr
        },
      }),
    ]
  },
})

export const segmentId: EditorPlugin = {
  id: 'segment-id',
  group: null,
  order: 0,
  extensions: () => [SegmentIdExtension],
}
