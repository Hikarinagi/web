import type { Editor } from '@tiptap/core'
import type { Node as PMNode } from '@tiptap/pm/model'
import { revealBlock } from './reveal'

function blockAt(editor: Editor, pos: number): PMNode | null {
  const { doc } = editor.state
  if (!Number.isInteger(pos) || pos < 0 || pos >= doc.content.size) return null
  return doc.nodeAt(pos)
}

export function moveBlock(editor: Editor, from: number, to: number): number | null {
  const node = blockAt(editor, from)
  if (!node) return null
  const end = from + node.nodeSize
  if (to >= from && to <= end) return null

  const tr = editor.state.tr
  tr.delete(from, end)
  const at = tr.mapping.map(to)
  tr.insert(at, node)
  tr.setMeta('hideDragHandle', true)
  editor.view.dispatch(tr)
  return at
}

export function insertAfterBlock(editor: Editor, pos: number): boolean {
  const node = blockAt(editor, pos)
  if (!node) return false
  editor
    .chain()
    .focus()
    .insertContentAt(pos + node.nodeSize, {
      type: 'paragraph',
      content: [{ type: 'text', text: '/' }],
    })
    .run()
  revealBlock(editor.view, pos + node.nodeSize)
  return true
}

export function insertBeforeBlock(editor: Editor, pos: number): boolean {
  if (!blockAt(editor, pos)) return false
  editor
    .chain()
    .focus()
    .insertContentAt(pos, { type: 'paragraph', content: [{ type: 'text', text: '/' }] })
    .run()
  revealBlock(editor.view, pos)
  return true
}

function duplicateOf(node: PMNode): PMNode {
  const attrs =
    node.type.name === 'poll' ? { ...node.attrs, poll_key: crypto.randomUUID() } : node.attrs
  return node.type.create(attrs, node.content, node.marks)
}

export function duplicateBlock(editor: Editor, pos: number): boolean {
  const node = blockAt(editor, pos)
  if (!node) return false
  const at = pos + node.nodeSize
  editor.view.dispatch(editor.state.tr.insert(at, duplicateOf(node)))
  revealBlock(editor.view, at)
  return true
}

export function deleteBlock(editor: Editor, pos: number): boolean {
  const node = blockAt(editor, pos)
  if (!node) return false
  editor.view.dispatch(editor.state.tr.delete(pos, pos + node.nodeSize))
  return true
}

export type BlockConversion =
  | { kind: 'paragraph' }
  | { kind: 'heading'; level: number }
  | { kind: 'bullet_list' }
  | { kind: 'ordered_list' }
  | { kind: 'blockquote' }
  | { kind: 'code_block' }

export function canConvertBlock(editor: Editor, pos: number): boolean {
  return blockAt(editor, pos)?.isTextblock ?? false
}

export function convertBlock(editor: Editor, pos: number, target: BlockConversion): boolean {
  if (!canConvertBlock(editor, pos)) return false
  const chain = editor
    .chain()
    .focus()
    .setTextSelection(pos + 1)
  switch (target.kind) {
    case 'paragraph':
      return chain.setParagraph().run()
    case 'heading':
      return chain.setNode('heading', { level: target.level }).run()
    case 'bullet_list':
      return chain.toggleBulletList().run()
    case 'ordered_list':
      return chain.toggleOrderedList().run()
    case 'blockquote':
      return chain.toggleBlockquote().run()
    case 'code_block':
      return chain.toggleCodeBlock().run()
  }
}
