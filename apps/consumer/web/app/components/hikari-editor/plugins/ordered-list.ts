import { ListOrdered as ListOrderedIcon } from '@lucide/vue'
import ListItem from '@tiptap/extension-list-item'
import OrderedList from '@tiptap/extension-ordered-list'
import type { EditorPlugin } from './types'

export const orderedList: EditorPlugin = {
  id: 'ordered-list',
  group: 'format-block',
  order: 2,
  shortcut: 'Mod-Shift-7',
  extensions: () => [
    OrderedList.extend({ name: 'ordered_list' }).configure({ itemTypeName: 'list_item' }),
    ListItem.extend({ name: 'list_item' }),
  ],
  toolbarItem: {
    icon: ListOrderedIcon,
    tooltip: '有序列表',
    isActive: editor => editor.isActive('ordered_list'),
    onClick: editor => {
      editor.chain().focus().toggleOrderedList().run()
    },
  },
}
