import { Minus as MinusIcon } from '@lucide/vue'
import type { Editor } from '@tiptap/core'
import HorizontalRuleExt from '@tiptap/extension-horizontal-rule'
import { insertAfterTable } from './table/insert'
import type { EditorPlugin } from './types'

export function insertHorizontalRule(editor: Editor) {
  if (insertAfterTable(editor, [{ type: 'horizontal_rule' }, { type: 'paragraph' }])) return
  editor.chain().focus().setHorizontalRule().run()
}

export const horizontalRule: EditorPlugin = {
  id: 'horizontal-rule',
  group: 'format-block',
  order: 5,
  extensions: () => [HorizontalRuleExt.extend({ name: 'horizontal_rule' })],
  toolbarItem: {
    icon: MinusIcon,
    tooltip: '分隔线',
    onClick: insertHorizontalRule,
  },
}
