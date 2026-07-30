import { List as ListIcon } from '@lucide/vue'
import BulletList from '@tiptap/extension-bullet-list'
import ListItem from '@tiptap/extension-list-item'
import type { EditorPlugin } from './types'

export const bulletList: EditorPlugin = {
  id: 'bullet-list',
  group: 'format-block',
  order: 1,
  shortcut: 'Mod-Shift-8',
  extensions: () => [
    BulletList.extend({ name: 'bullet_list' }).configure({ itemTypeName: 'list_item' }),
    ListItem.extend({ name: 'list_item' }),
  ],
  toolbarItem: {
    icon: ListIcon,
    tooltip: '无序列表',
    isActive: editor => editor.isActive('bullet_list'),
    onClick: editor => {
      editor.chain().focus().toggleBulletList().run()
    },
  },
}
