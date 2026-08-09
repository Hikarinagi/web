import type { Content, Editor } from '@tiptap/core'

export function insertAfterTable(editor: Editor, content: Content): boolean {
  const { $from } = editor.state.selection
  for (let depth = $from.depth; depth > 0; depth--) {
    if ($from.node(depth).type.name !== 'table') continue
    editor.chain().focus().insertContentAt($from.after(depth), content).run()
    return true
  }
  return false
}
