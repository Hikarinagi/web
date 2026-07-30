import { Smile } from '@lucide/vue'
import { EmojiInlineExtension } from '@hikarinagi/editor-schema'
import { VueNodeViewRenderer } from '@tiptap/vue-3'
import type { EditorPlugin } from '../types'
import EmojiInlineNodeView from './inline/NodeView.vue'
import EmojiPicker from './EmojiPicker.vue'

const EmojiInline = EmojiInlineExtension.extend({
  addNodeView() {
    return VueNodeViewRenderer(EmojiInlineNodeView)
  },
})

export const emoji: EditorPlugin = {
  id: 'emoji',
  group: 'insert-media',
  order: 10,
  extensions: () => [EmojiInline],
  toolbarItem: {
    icon: Smile,
    tooltip: '插入贴纸',
    onClick: (editor, ctx, trigger) => {
      ctx.openOverlay('emoji-picker', trigger, { editor })
    },
  },
  overlays: {
    'emoji-picker': EmojiPicker,
  },
}
