import { ImageBlockExtension } from '@hikarinagi/editor-schema'
import { Editor } from '@tiptap/core'
import BulletList from '@tiptap/extension-bullet-list'
import Document from '@tiptap/extension-document'
import ListItem from '@tiptap/extension-list-item'
import Paragraph from '@tiptap/extension-paragraph'
import TextExt from '@tiptap/extension-text'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { useEditorPlugins } from '../../../app/components/hikari-editor/plugins'
import { insertTable, table } from '../../../app/components/hikari-editor/plugins/table'
import { insertAfterTable } from '../../../app/components/hikari-editor/plugins/table/insert'
import type { EditorPluginContext } from '../../../app/components/hikari-editor/plugins/types'

const ctx = undefined as unknown as EditorPluginContext

interface JsonNode {
  type?: string
  content?: JsonNode[]
}

function rowsOf(editor: Editor): JsonNode[] {
  const doc = editor.getJSON() as JsonNode
  const node = doc.content?.find(child => child.type === 'table')
  return node?.content ?? []
}

describe('table 编辑插件', () => {
  let editor: Editor

  beforeEach(() => {
    editor = new Editor({
      element: document.createElement('div'),
      extensions: [
        Document,
        Paragraph,
        TextExt,
        ImageBlockExtension,
        BulletList.extend({ name: 'bullet_list' }).configure({ itemTypeName: 'list_item' }),
        ListItem.extend({ name: 'list_item' }),
        ...(table.extensions?.(ctx) ?? []),
      ],
      content: '<p></p>',
    })
  })

  afterEach(() => {
    editor.destroy()
  })

  it('只在 community(文章)profile 挂载', () => {
    expect(useEditorPlugins('community').map(p => p.id)).toContain('table')
    for (const profile of ['post', 'comment', 'private_message'] as const) {
      expect(useEditorPlugins(profile).map(p => p.id)).not.toContain('table')
    }
  })

  it('插入表格产出 snake_case 节点，首行是表头', () => {
    insertTable(editor)

    const rows = rowsOf(editor)
    expect(rows).toHaveLength(3)
    expect(rows.every(row => row.type === 'table_row')).toBe(true)
    expect(rows[0]?.content?.map(cell => cell.type)).toEqual([
      'table_header',
      'table_header',
      'table_header',
    ])
    expect(rows[1]?.content?.map(cell => cell.type)).toEqual([
      'table_cell',
      'table_cell',
      'table_cell',
    ])
  })

  it('工具栏只负责插入：表格里禁用，表格外可用', () => {
    expect(table.toolbarItem?.isDisabled?.(editor)).toBe(false)
    insertTable(editor)
    expect(table.toolbarItem?.isDisabled?.(editor)).toBe(true)
    expect(table.toolbarItem?.dropdownItems).toBeUndefined()
  })

  it('光标进表格后行列命令才可用', () => {
    expect(editor.can().addRowAfter()).toBe(false)
    expect(editor.can().deleteTable()).toBe(false)

    insertTable(editor)

    expect(editor.can().addRowAfter()).toBe(true)
    expect(editor.can().addColumnAfter()).toBe(true)
    expect(editor.can().deleteTable()).toBe(true)
  })

  it('在单元格里再次插入表格不会拆散原表格', () => {
    insertTable(editor)
    insertTable(editor)

    const doc = editor.getJSON() as JsonNode
    expect(doc.content?.filter(child => child.type === 'table')).toHaveLength(1)
    expect(rowsOf(editor)).toHaveLength(3)
  })

  it('在单元格里插入块级节点时落到表格之后，表格保持完整', () => {
    insertTable(editor)

    const inserted = insertAfterTable(editor, [
      { type: 'image_block', attrs: { media_asset_id: 1, src: 'media/a.webp' } },
    ])

    const doc = editor.getJSON() as JsonNode
    expect(inserted).toBe(true)
    expect(doc.content?.map(child => child.type)).toEqual(['table', 'image_block'])
    expect(rowsOf(editor)).toHaveLength(3)
    expect(rowsOf(editor)[0]?.content).toHaveLength(3)
  })

  it('光标不在表格里时 insertAfterTable 不接管插入', () => {
    expect(insertAfterTable(editor, [{ type: 'paragraph' }])).toBe(false)
  })

  it('增删行列改变表格结构', () => {
    insertTable(editor)
    expect(rowsOf(editor)).toHaveLength(3)

    editor.commands.addRowAfter()
    expect(rowsOf(editor)).toHaveLength(4)

    editor.commands.deleteRow()
    expect(rowsOf(editor)).toHaveLength(3)

    editor.commands.addColumnAfter()
    expect(rowsOf(editor)[0]?.content).toHaveLength(4)

    editor.commands.deleteColumn()
    expect(rowsOf(editor)[0]?.content).toHaveLength(3)
  })

  it('删除表格后文档里不再有 table 节点', () => {
    insertTable(editor)
    editor.commands.deleteTable()

    expect(editor.isActive('table')).toBe(false)
    expect(rowsOf(editor)).toHaveLength(0)
  })

  it('往单元格里粘贴列表会摊平成段落，表格不被拆开', () => {
    insertTable(editor)
    editor.view.pasteHTML('<ul><li>甲</li><li>乙</li></ul>')

    const doc = editor.getJSON() as JsonNode
    expect(doc.content?.map(child => child.type)).toEqual(['table'])
    const cell = rowsOf(editor)[0]?.content?.[0]
    expect(cell?.content?.map(child => child.type)).toEqual(['paragraph', 'paragraph'])
    expect(editor.getText()).toContain('甲')
  })

  it('往单元格里粘贴表格交给 prosemirror-tables 合并，不产生嵌套表格', () => {
    insertTable(editor)
    editor.view.pasteHTML('<table><tbody><tr><td>外部</td></tr></tbody></table>')

    const doc = editor.getJSON() as JsonNode
    expect(doc.content?.filter(child => child.type === 'table')).toHaveLength(1)
    expect(JSON.stringify(rowsOf(editor))).not.toContain('"table"')
  })

  it('表格外粘贴列表不受影响', () => {
    editor.view.pasteHTML('<ul><li>甲</li></ul>')

    const doc = editor.getJSON() as JsonNode
    expect(doc.content?.some(child => child.type === 'bullet_list')).toBe(true)
  })
})
