import { Strikethrough as StrikeIcon } from '@lucide/vue'
import StrikeExt from '@tiptap/extension-strike'
import type { EditorPlugin } from './types'

export const strike: EditorPlugin = {
  id: 'strike',
  group: 'format-inline',
  order: 2,
  shortcut: 'Mod-Shift-x',
  extensions: () => [StrikeExt],
  toolbarItem: {
    icon: StrikeIcon,
    tooltip: '删除线',
    isActive: editor => editor.isActive('strike'),
    onClick: editor => {
      editor.chain().focus().toggleStrike().run()
    },
  },
}
