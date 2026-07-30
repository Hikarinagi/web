import { Quote as QuoteIcon } from '@lucide/vue'
import BlockquoteExt from '@tiptap/extension-blockquote'
import type { EditorPlugin } from './types'

export const blockquote: EditorPlugin = {
  id: 'blockquote',
  group: 'format-block',
  order: 3,
  shortcut: 'Mod-Shift-b',
  extensions: () => [BlockquoteExt],
  toolbarItem: {
    icon: QuoteIcon,
    tooltip: '引用块',
    isActive: editor => editor.isActive('blockquote'),
    onClick: editor => {
      editor.chain().focus().toggleBlockquote().run()
    },
  },
}
