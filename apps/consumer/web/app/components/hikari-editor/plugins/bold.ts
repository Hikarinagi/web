import { Bold as BoldIcon } from '@lucide/vue'
import BoldExt from '@tiptap/extension-bold'
import type { EditorPlugin } from './types'

export const bold: EditorPlugin = {
  id: 'bold',
  group: 'format-inline',
  order: 0,
  shortcut: 'Mod-b',
  extensions: () => [BoldExt],
  toolbarItem: {
    icon: BoldIcon,
    tooltip: '粗体',
    isActive: editor => editor.isActive('bold'),
    onClick: editor => {
      editor.chain().focus().toggleBold().run()
    },
  },
}
