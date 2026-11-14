import { toast } from '@hina-ui/vue'
import type { Editor } from '@tiptap/core'
import { ENTITY_CARD_NODE_TYPES } from '@hikarinagi/editor-schema'

export function entityCardsFull(editor: Editor, limit: number | undefined) {
  if (limit === undefined) return false
  let count = 0
  editor.state.doc.descendants(node => {
    if (ENTITY_CARD_NODE_TYPES.has(node.type.name as never)) count++
  })
  if (count < limit) return false
  toast.warning(`正文最多插入 ${limit} 个卡片`)
  return true
}
