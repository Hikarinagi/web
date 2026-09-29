import { Mark, mergeAttributes } from '@tiptap/core'
import { Highlighter } from '@lucide/vue'
import type { EditorPlugin } from './types'

const EmphasisMark = Mark.create({
  name: 'emphasis',
  excludes: 'ruby',
  parseHTML() {
    return [{ tag: 'em.emphasis' }]
  },
  renderHTML({ HTMLAttributes }) {
    return [
      'em',
      mergeAttributes(HTMLAttributes, { class: 'emphasis not-italic [text-emphasis:filled_dot]' }),
      0,
    ]
  },
})

export const emphasis: EditorPlugin = {
  id: 'emphasis',
  group: 'format-inline',
  order: 1,
  extensions: () => [EmphasisMark],
  toolbarItem: {
    icon: Highlighter,
    tooltip: '着重号',
    isActive: editor => editor.isActive('emphasis'),
    onClick: editor => {
      editor.chain().focus().toggleMark('emphasis').run()
    },
  },
}
