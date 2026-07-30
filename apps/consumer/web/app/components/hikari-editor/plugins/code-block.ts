import { Braces as BracesIcon } from '@lucide/vue'
import CodeBlockExt from '@tiptap/extension-code-block'
import type { EditorPlugin } from './types'

export const codeBlock: EditorPlugin = {
  id: 'code-block',
  group: 'format-block',
  order: 4,
  shortcut: 'Mod-Alt-c',
  extensions: () => [CodeBlockExt.extend({ name: 'code_block' })],
  toolbarItem: {
    icon: BracesIcon,
    tooltip: '代码块',
    isActive: editor => editor.isActive('code_block'),
    onClick: editor => {
      editor.chain().focus().toggleCodeBlock().run()
    },
  },
}
