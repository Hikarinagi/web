import { Italic as ItalicIcon } from '@lucide/vue'
import ItalicExt from '@tiptap/extension-italic'
import type { EditorPlugin } from './types'

export const italic: EditorPlugin = {
  id: 'italic',
  group: 'format-inline',
  order: 1,
  shortcut: 'Mod-i',
  extensions: () => [ItalicExt],
  toolbarItem: {
    icon: ItalicIcon,
    tooltip: '斜体',
    isActive: editor => editor.isActive('italic'),
    onClick: editor => {
      editor.chain().focus().toggleItalic().run()
    },
  },
}
