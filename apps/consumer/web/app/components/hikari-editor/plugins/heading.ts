import {
  Heading as HeadingIcon,
  Heading2 as Heading2Icon,
  Heading3 as Heading3Icon,
  Heading4 as Heading4Icon,
} from '@lucide/vue'
import HeadingExt from '@tiptap/extension-heading'
import type { EditorPlugin } from './types'

export const heading: EditorPlugin = {
  id: 'heading',
  group: 'format-block',
  order: 0,
  extensions: () => [HeadingExt.configure({ levels: [2, 3, 4] })],
  toolbarItem: {
    icon: HeadingIcon,
    tooltip: '标题',
    variant: 'dropdown',
    isActive: editor =>
      editor.isActive('heading', { level: 2 }) ||
      editor.isActive('heading', { level: 3 }) ||
      editor.isActive('heading', { level: 4 }),
    dropdownItems: [
      {
        id: 'h2',
        icon: Heading2Icon,
        label: '标题 H2',
        onClick: editor => {
          editor.chain().focus().toggleHeading({ level: 2 }).run()
        },
      },
      {
        id: 'h3',
        icon: Heading3Icon,
        label: '标题 H3',
        onClick: editor => {
          editor.chain().focus().toggleHeading({ level: 3 }).run()
        },
      },
      {
        id: 'h4',
        icon: Heading4Icon,
        label: '标题 H4',
        onClick: editor => {
          editor.chain().focus().toggleHeading({ level: 4 }).run()
        },
      },
    ],
  },
}
