import { Code as CodeIcon } from '@lucide/vue'
import CodeExt from '@tiptap/extension-code'
import type { EditorPlugin } from './types'

export const code: EditorPlugin = {
  id: 'code',
  group: 'format-inline',
  order: 3,
  shortcut: 'Mod-e',
  extensions: () => [CodeExt],
  toolbarItem: {
    icon: CodeIcon,
    tooltip: '行内代码',
    isActive: editor => editor.isActive('code'),
    onClick: editor => {
      editor.chain().focus().toggleCode().run()
    },
  },
}
