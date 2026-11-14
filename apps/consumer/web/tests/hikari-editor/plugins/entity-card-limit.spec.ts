import { GalgameCardExtension, PersonCardExtension } from '@hikarinagi/editor-schema'
import { Editor } from '@tiptap/core'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import TextExt from '@tiptap/extension-text'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { entityCardsFull } from '../../../app/components/hikari-editor/plugins/entity-card/limit'

const warning = vi.fn()
vi.mock('@hina-ui/vue', async importOriginal => ({
  ...(await importOriginal<typeof import('@hina-ui/vue')>()),
  toast: { warning: (message: string) => warning(message) },
}))

function doc(galgames: number, people: number) {
  return {
    type: 'doc',
    content: [
      { type: 'paragraph', content: [{ type: 'text', text: '正文' }] },
      ...Array.from({ length: galgames }, (_, index) => ({
        type: 'galgame_card',
        attrs: { galgame_id: index + 1 },
      })),
      ...Array.from({ length: people }, (_, index) => ({
        type: 'person_card',
        attrs: { person_id: index + 1 },
      })),
    ],
  }
}

describe('正文卡片上限', () => {
  let editor: Editor

  beforeEach(() => {
    warning.mockClear()
    editor = new Editor({
      element: document.createElement('div'),
      extensions: [Document, Paragraph, TextExt, GalgameCardExtension, PersonCardExtension],
    })
  })

  afterEach(() => editor.destroy())

  it('未达到上限时放行，不提示', () => {
    editor.commands.setContent(doc(2, 1))
    expect(entityCardsFull(editor, 4)).toBe(false)
    expect(warning).not.toHaveBeenCalled()
  })

  it('各类卡片合计达到上限时拦截并说明上限', () => {
    editor.commands.setContent(doc(2, 2))
    expect(entityCardsFull(editor, 4)).toBe(true)
    expect(warning).toHaveBeenCalledWith('正文最多插入 4 个卡片')
  })

  it('没有配置上限的编辑器不做检查', () => {
    editor.commands.setContent(doc(20, 0))
    expect(entityCardsFull(editor, undefined)).toBe(false)
  })
})
