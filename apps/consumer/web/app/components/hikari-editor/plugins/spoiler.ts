import { EyeOff } from '@lucide/vue'
import { SpoilerMark } from '@hikarinagi/editor-schema'
import type { EditorPlugin } from './types'

export const spoiler: EditorPlugin = {
  id: 'spoiler',
  group: 'format-inline',
  order: 5,
  shortcut: 'Mod-Shift-s',
  extensions: () => [SpoilerMark],
  toolbarItem: {
    icon: EyeOff,
    tooltip: '剧透',
    isActive: editor => editor.isActive('spoiler'),
    onClick: editor => {
      editor.chain().focus().toggleMark('spoiler').run()
    },
  },
}
