import { AlignCenter, AlignJustify, AlignLeft, AlignRight } from '@lucide/vue'
import { TextAlignExtension } from '@hikarinagi/editor-schema'
import type { Editor } from '@tiptap/core'
import type { EditorPlugin } from './types'

const ALIGN_TARGETS = ['paragraph', 'heading'] as const

function setAlign(editor: Editor, value: string | null): void {
  let chain = editor.chain().focus()
  for (const type of ALIGN_TARGETS) chain = chain.updateAttributes(type, { text_align: value })
  chain.run()
}

function hasAlign(editor: Editor, value: string): boolean {
  return ALIGN_TARGETS.some(type => editor.isActive(type, { text_align: value }))
}

export const textAlign: EditorPlugin = {
  id: 'text-align',
  group: 'format-block',
  order: 5,
  extensions: () => [TextAlignExtension],
  toolbarItem: {
    icon: AlignLeft,
    tooltip: '对齐',
    variant: 'dropdown',
    isActive: editor =>
      hasAlign(editor, 'center') || hasAlign(editor, 'right') || hasAlign(editor, 'justify'),
    dropdownItems: [
      { id: 'left', icon: AlignLeft, label: '左对齐', onClick: editor => setAlign(editor, null) },
      {
        id: 'center',
        icon: AlignCenter,
        label: '居中',
        onClick: editor => setAlign(editor, 'center'),
      },
      {
        id: 'right',
        icon: AlignRight,
        label: '右对齐',
        onClick: editor => setAlign(editor, 'right'),
      },
      {
        id: 'justify',
        icon: AlignJustify,
        label: '两端对齐',
        onClick: editor => setAlign(editor, 'justify'),
      },
    ],
  },
}
