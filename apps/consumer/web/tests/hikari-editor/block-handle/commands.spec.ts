import { Editor } from '@tiptap/core'
import Document from '@tiptap/extension-document'
import Heading from '@tiptap/extension-heading'
import Paragraph from '@tiptap/extension-paragraph'
import TextExt from '@tiptap/extension-text'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import {
  convertBlock,
  deleteBlock,
  duplicateBlock,
  insertAfterBlock,
  insertBeforeBlock,
  moveBlock,
} from '../../../app/components/hikari-editor/block-handle/commands'

interface JsonNode {
  type?: string
  content?: JsonNode[]
  text?: string
}

function blocks(editor: Editor): JsonNode[] {
  return (editor.getJSON() as JsonNode).content ?? []
}

function posOf(editor: Editor, index: number): number {
  let pos = 0
  editor.state.doc.forEach((node, offset, i) => {
    if (i === index) pos = offset
  })
  return pos
}

describe('block handle 插入命令', () => {
  let editor: Editor

  beforeEach(() => {
    editor = new Editor({
      element: document.createElement('div'),
      extensions: [Document, Paragraph, TextExt, Heading.configure({ levels: [2, 3, 4] })],
      content: '<h2>标题</h2><p>第一段</p><p>第二段</p>',
    })
  })

  afterEach(() => {
    editor.destroy()
  })

  it('插到目标块之后，而不是块内', () => {
    insertAfterBlock(editor, posOf(editor, 0))

    const after = blocks(editor)
    expect(after).toHaveLength(4)
    expect(after[0]?.type).toBe('heading')
    expect(after[0]?.content?.[0]?.text).toBe('标题')
    expect(after[1]?.type).toBe('paragraph')
  })

  it('新段落预置斜杠，直接把命令菜单准备好', () => {
    insertAfterBlock(editor, posOf(editor, 2))
    expect(blocks(editor)[3]?.content?.[0]?.text).toBe('/')
  })

  it('越界位置不抛异常，返回 false', () => {
    expect(insertAfterBlock(editor, 9999)).toBe(false)
    expect(insertAfterBlock(editor, -1)).toBe(false)
    expect(blocks(editor)).toHaveLength(3)
  })
})

describe('block handle 移动命令', () => {
  let editor: Editor

  beforeEach(() => {
    editor = new Editor({
      element: document.createElement('div'),
      extensions: [Document, Paragraph, TextExt, Heading.configure({ levels: [2, 3, 4] })],
      content: '<h2>A</h2><p>B</p><p>C</p>',
    })
  })

  afterEach(() => {
    editor.destroy()
  })

  function texts(): string[] {
    return blocks(editor).map(node => node.content?.[0]?.text ?? '')
  }

  it('往下移：块落到目标块之后', () => {
    const from = posOf(editor, 0)
    const to = posOf(editor, 2) + editor.state.doc.child(2).nodeSize
    expect(moveBlock(editor, from, to)).not.toBeNull()
    expect(texts()).toEqual(['B', 'C', 'A'])
  })

  it('往上移：块落到目标块之前', () => {
    expect(moveBlock(editor, posOf(editor, 2), 0)).not.toBeNull()
    expect(texts()).toEqual(['C', 'A', 'B'])
  })

  it('移动保留节点类型，不退化成段落', () => {
    const from = posOf(editor, 0)
    const to = posOf(editor, 1) + editor.state.doc.child(1).nodeSize
    moveBlock(editor, from, to)
    expect(blocks(editor).map(node => node.type)).toEqual(['paragraph', 'heading', 'paragraph'])
  })

  it('落点在自己身上时不动', () => {
    const from = posOf(editor, 1)
    expect(moveBlock(editor, from, from)).toBeNull()
    expect(moveBlock(editor, from, from + editor.state.doc.child(1).nodeSize)).toBeNull()
    expect(texts()).toEqual(['A', 'B', 'C'])
  })

  it('越界起点返回 false', () => {
    expect(moveBlock(editor, 9999, 0)).toBeNull()
    expect(texts()).toEqual(['A', 'B', 'C'])
  })
})

describe('moveBlock 返回落点', () => {
  it('返回的位置就是移动后该块所在的位置', () => {
    const editor = new Editor({
      element: document.createElement('div'),
      extensions: [Document, Paragraph, TextExt],
      content: '<p>A</p><p>B</p><p>C</p>',
    })
    const from = 0
    const to = editor.state.doc.content.size
    const landed = moveBlock(editor, from, to)

    expect(landed).not.toBeNull()
    expect(editor.state.doc.nodeAt(landed!)?.textContent).toBe('A')
    editor.destroy()
  })

  it('拿旧位置过映射找不回这个块，所以落点只能用返回值', () => {
    const editor = new Editor({
      element: document.createElement('div'),
      extensions: [Document, Paragraph, TextExt],
      content: '<p>A</p><p>B</p><p>C</p>',
    })
    let mapped = -1
    editor.on('transaction', ({ transaction }) => {
      if (transaction.docChanged) mapped = transaction.mapping.map(0)
    })
    const landed = moveBlock(editor, 0, editor.state.doc.content.size)

    expect(mapped).not.toBe(landed)
    expect(editor.state.doc.nodeAt(mapped)?.textContent).toBe('B')
    editor.destroy()
  })

  it('移动的事务带 hideDragHandle，逼扩展丢掉过期锚点', () => {
    const editor = new Editor({
      element: document.createElement('div'),
      extensions: [Document, Paragraph, TextExt],
      content: '<p>A</p><p>B</p><p>C</p>',
    })
    let meta: unknown
    editor.on('transaction', ({ transaction }) => {
      if (transaction.docChanged) meta = transaction.getMeta('hideDragHandle')
    })
    moveBlock(editor, 0, editor.state.doc.content.size)

    expect(meta).toBe(true)
    editor.destroy()
  })
})

describe('block handle 菜单命令', () => {
  let editor: Editor

  beforeEach(() => {
    editor = new Editor({
      element: document.createElement('div'),
      extensions: [Document, Paragraph, TextExt, Heading.configure({ levels: [2, 3, 4] })],
      content: '<p>A</p><h2>B</h2>',
    })
  })

  afterEach(() => {
    editor.destroy()
  })

  it('创建副本插在原块之后，内容一致', () => {
    expect(duplicateBlock(editor, posOf(editor, 0))).toBe(true)
    const after = blocks(editor)
    expect(after).toHaveLength(3)
    expect(after[0]?.content?.[0]?.text).toBe('A')
    expect(after[1]?.content?.[0]?.text).toBe('A')
    expect(after[2]?.content?.[0]?.text).toBe('B')
  })

  it('副本是独立节点，改原块不影响副本', () => {
    duplicateBlock(editor, posOf(editor, 0))
    editor.chain().setTextSelection(1).insertContent('X').run()
    const after = blocks(editor)
    expect(after[0]?.content?.[0]?.text).not.toBe(after[1]?.content?.[0]?.text)
  })

  it('副本必须是新的 Node 实例，不能和原块共享引用', () => {
    duplicateBlock(editor, posOf(editor, 0))
    const doc = editor.state.doc
    expect(doc.child(0).eq(doc.child(1))).toBe(true)
    expect(doc.child(0)).not.toBe(doc.child(1))
  })

  it('删除只删目标块', () => {
    expect(deleteBlock(editor, posOf(editor, 0))).toBe(true)
    expect(blocks(editor).map(node => node.type)).toEqual(['heading'])
  })

  it('转换正文为标题，保留文字', () => {
    expect(convertBlock(editor, posOf(editor, 0), { kind: 'heading', level: 3 })).toBe(true)
    const first = blocks(editor)[0]
    expect(first?.type).toBe('heading')
    expect(first?.content?.[0]?.text).toBe('A')
  })

  it('标题转回正文', () => {
    expect(convertBlock(editor, posOf(editor, 1), { kind: 'paragraph' })).toBe(true)
    expect(blocks(editor)[1]?.type).toBe('paragraph')
  })

  it('在块之前插入新段落', () => {
    expect(insertBeforeBlock(editor, posOf(editor, 1))).toBe(true)
    expect(blocks(editor).map(node => node.type)).toEqual(['paragraph', 'paragraph', 'heading'])
  })

  it('越界位置一律返回 false，且不改动文档', () => {
    expect(duplicateBlock(editor, 9999)).toBe(false)
    expect(deleteBlock(editor, 9999)).toBe(false)
    expect(insertBeforeBlock(editor, 9999)).toBe(false)
    expect(convertBlock(editor, 9999, { kind: 'paragraph' })).toBe(false)
    expect(blocks(editor)).toHaveLength(2)
  })
})
