import { Minus as MinusIcon } from '@lucide/vue'
import HorizontalRuleExt from '@tiptap/extension-horizontal-rule'
import type { EditorPlugin } from './types'

export const horizontalRule: EditorPlugin = {
  id: 'horizontal-rule',
  group: 'format-block',
  order: 5,
  extensions: () => [HorizontalRuleExt.extend({ name: 'horizontal_rule' })],
  toolbarItem: {
    icon: MinusIcon,
    tooltip: '分隔线',
    onClick: editor => {
      editor.chain().focus().setHorizontalRule().run()
    },
  },
}
