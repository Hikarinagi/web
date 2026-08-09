import type { Editor } from '@tiptap/core'
import type { Node as PMNode } from '@tiptap/pm/model'
import {
  CellSelection,
  TableMap,
  columnIsHeader,
  moveTableColumn,
  moveTableRow,
  rowIsHeader,
} from '@tiptap/pm/tables'
import type { TableCellAlign } from '@hikarinagi/editor-schema'

export interface TableRef {
  pos: number
  node: PMNode
}

export type TableAxis = 'row' | 'column'

export function tableAt(editor: Editor, pos: number): TableRef | null {
  const node = editor.state.doc.nodeAt(pos)
  return node?.type.name === 'table' ? { pos, node } : null
}

function cellOffset(table: TableRef, row: number, col: number): number | null {
  const map = TableMap.get(table.node)
  if (row < 0 || col < 0 || row >= map.height || col >= map.width) return null
  return map.positionAt(row, col, table.node)
}

function lineEnds(table: TableRef, axis: TableAxis, index: number) {
  const map = TableMap.get(table.node)
  const from = axis === 'column' ? cellOffset(table, 0, index) : cellOffset(table, index, 0)
  const to =
    axis === 'column'
      ? cellOffset(table, map.height - 1, index)
      : cellOffset(table, index, map.width - 1)
  return from === null || to === null ? null : { from, to }
}

function select(editor: Editor, table: TableRef, from: number, to: number, axis: TableAxis) {
  const start = table.pos + 1
  const { doc } = editor.state
  const $from = doc.resolve(start + from)
  const $to = doc.resolve(start + to)
  const selection =
    axis === 'column'
      ? CellSelection.colSelection($from, $to)
      : CellSelection.rowSelection($from, $to)
  editor.view.dispatch(editor.state.tr.setSelection(selection))
  return true
}

export function selectLine(
  editor: Editor,
  table: TableRef,
  axis: TableAxis,
  index: number,
): boolean {
  const ends = lineEnds(table, axis, index)
  return ends ? select(editor, table, ends.from, ends.to, axis) : false
}

export function isHeaderLine(table: TableRef, axis: TableAxis, index: number): boolean {
  const map = TableMap.get(table.node)
  return axis === 'column'
    ? columnIsHeader(map, table.node, index)
    : rowIsHeader(map, table.node, index)
}

export function alignOf(table: TableRef, axis: TableAxis, index: number): TableCellAlign | null {
  const offset = axis === 'column' ? cellOffset(table, 0, index) : cellOffset(table, index, 0)
  if (offset === null) return null
  const value = table.node.nodeAt(offset)?.attrs.align
  return typeof value === 'string' ? (value as TableCellAlign) : null
}

export function moveLine(
  editor: Editor,
  table: TableRef,
  axis: TableAxis,
  from: number,
  to: number,
): boolean {
  if (from === to) return false
  if (!selectLine(editor, table, axis, from)) return false
  const move = axis === 'column' ? moveTableColumn : moveTableRow
  return move({ from, to, pos: table.pos + 1 })(editor.state, editor.view.dispatch)
}

export function appendLine(editor: Editor, table: TableRef, axis: TableAxis): boolean {
  const map = TableMap.get(table.node)
  const last =
    axis === 'column' ? cellOffset(table, 0, map.width - 1) : cellOffset(table, map.height - 1, 0)
  if (last === null) return false
  const chain = editor.chain().setCellSelection({ anchorCell: table.pos + 1 + last })
  return axis === 'column' ? chain.addColumnAfter().run() : chain.addRowAfter().run()
}

export function setAlign(editor: Editor, value: TableCellAlign | null): boolean {
  return editor.chain().focus().setCellAttribute('align', value).run()
}
