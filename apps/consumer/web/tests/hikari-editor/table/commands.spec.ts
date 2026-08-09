import {
  TableCellExtension,
  TableExtension,
  TableHeaderExtension,
  TableRowExtension,
} from '@hikarinagi/editor-schema'
import { Editor } from '@tiptap/core'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import TextExt from '@tiptap/extension-text'
import { CellSelection, TableMap } from '@tiptap/pm/tables'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import {
  alignOf,
  appendLine,
  isHeaderLine,
  moveLine,
  selectLine,
  setAlign,
  tableAt,
  type TableRef,
} from '../../../app/components/hikari-editor/table/commands'

const CONTENT =
  '<table><tbody>' +
  '<tr><th>甲</th><th>乙</th><th>丙</th></tr>' +
  '<tr><td>a1</td><td>b1</td><td>c1</td></tr>' +
  '<tr><td>a2</td><td>b2</td><td>c2</td></tr>' +
  '</tbody></table>'

function grid(editor: Editor): string[][] {
  const table = editor.state.doc.child(0)
  const map = TableMap.get(table)
  const rows: string[][] = []
  for (let row = 0; row < map.height; row++) {
    const cells: string[] = []
    for (let col = 0; col < map.width; col++) {
      cells.push(table.nodeAt(map.positionAt(row, col, table))?.textContent ?? '')
    }
    rows.push(cells)
  }
  return rows
}

describe('表格命令', () => {
  let editor: Editor
  let table: TableRef

  beforeEach(() => {
    editor = new Editor({
      element: document.createElement('div'),
      extensions: [
        Document,
        Paragraph,
        TextExt,
        TableExtension.configure({ resizable: false }),
        TableRowExtension,
        TableHeaderExtension,
        TableCellExtension,
      ],
      content: CONTENT,
    })
    table = tableAt(editor, 0)!
  })

  afterEach(() => {
    editor.destroy()
  })

  it('tableAt 只在位置确实是表格时返回', () => {
    expect(table).not.toBeNull()
    expect(table.node.type.name).toBe('table')
    expect(tableAt(editor, 1)).toBeNull()
  })

  it('选中列：拿到跨整列的 CellSelection', () => {
    expect(selectLine(editor, table, 'column', 1)).toBe(true)

    const selection = editor.state.selection
    expect(selection).toBeInstanceOf(CellSelection)
    expect((selection as CellSelection).isColSelection()).toBe(true)

    const texts: string[] = []
    ;(selection as CellSelection).forEachCell(node => texts.push(node.textContent))
    expect(texts).toEqual(['乙', 'b1', 'b2'])
  })

  it('选中行：拿到跨整行的 CellSelection', () => {
    expect(selectLine(editor, table, 'row', 2)).toBe(true)

    const selection = editor.state.selection as CellSelection
    expect(selection.isRowSelection()).toBe(true)

    const texts: string[] = []
    selection.forEachCell(node => texts.push(node.textContent))
    expect(texts).toEqual(['a2', 'b2', 'c2'])
  })

  it('越界的行列索引不炸，返回 false', () => {
    expect(selectLine(editor, table, 'column', 9)).toBe(false)
    expect(selectLine(editor, table, 'row', -1)).toBe(false)
  })

  it('列重排：把第一列挪到最后', () => {
    expect(moveLine(editor, table, 'column', 0, 2)).toBe(true)
    expect(grid(editor)).toEqual([
      ['乙', '丙', '甲'],
      ['b1', 'c1', 'a1'],
      ['b2', 'c2', 'a2'],
    ])
  })

  it('行重排：把最后一行挪到最前', () => {
    expect(moveLine(editor, table, 'row', 2, 0)).toBe(true)
    expect(grid(editor).map(row => row[0])).toEqual(['a2', '甲', 'a1'])
  })

  it('重排不依赖调用方先选中，命令自己会把选区落进表格', () => {
    editor.commands.setTextSelection(0)
    expect(moveLine(editor, table, 'column', 0, 1)).toBe(true)
    expect(grid(editor)[0]).toEqual(['乙', '甲', '丙'])
  })

  it('原地不动的重排直接返回 false', () => {
    expect(moveLine(editor, table, 'column', 1, 1)).toBe(false)
    expect(grid(editor)[0]).toEqual(['甲', '乙', '丙'])
  })

  it('追加列：加在最右侧，行数不变', () => {
    expect(appendLine(editor, table, 'column')).toBe(true)

    const map = TableMap.get(editor.state.doc.child(0))
    expect(map.width).toBe(4)
    expect(map.height).toBe(3)
    expect(grid(editor)[0]).toEqual(['甲', '乙', '丙', ''])
  })

  it('追加行：加在最下方，列数不变', () => {
    expect(appendLine(editor, table, 'row')).toBe(true)

    const map = TableMap.get(editor.state.doc.child(0))
    expect(map.height).toBe(4)
    expect(map.width).toBe(3)
    expect(grid(editor)[3]).toEqual(['', '', ''])
  })

  it('表头行判定认第一行，不认数据行', () => {
    expect(isHeaderLine(table, 'row', 0)).toBe(true)
    expect(isHeaderLine(table, 'row', 1)).toBe(false)
  })

  it('对齐：写在整列上，再读回来', () => {
    selectLine(editor, table, 'column', 1)
    expect(setAlign(editor, 'center')).toBe(true)

    const next = tableAt(editor, 0)!
    expect(alignOf(next, 'column', 1)).toBe('center')
    expect(alignOf(next, 'column', 0)).toBeNull()
  })

  it('把手选中列之后，删除命令删的是整列而不是一个格', () => {
    selectLine(editor, table, 'column', 1)
    editor.commands.deleteColumn()

    expect(TableMap.get(editor.state.doc.child(0)).width).toBe(2)
    expect(grid(editor)[0]).toEqual(['甲', '丙'])
  })

  it('表头是表级属性：切换只动首行，跟当前选中哪行无关', () => {
    selectLine(editor, table, 'row', 1)
    editor.commands.toggleHeaderRow()

    const next = tableAt(editor, 0)!
    expect(isHeaderLine(next, 'row', 0)).toBe(false)
    expect(isHeaderLine(next, 'row', 1)).toBe(false)
  })

  it('对齐可以清回默认', () => {
    selectLine(editor, table, 'column', 0)
    setAlign(editor, 'right')
    selectLine(editor, tableAt(editor, 0)!, 'column', 0)
    setAlign(editor, null)

    expect(alignOf(tableAt(editor, 0)!, 'column', 0)).toBeNull()
  })
})
