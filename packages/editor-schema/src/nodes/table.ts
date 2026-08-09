import { Table, TableCell, TableHeader, TableRow } from '@tiptap/extension-table'

export const TABLE_CELL_MIN_WIDTH = 120

export const TABLE_CELL_ALIGN_VALUES = ['left', 'center', 'right'] as const

export type TableCellAlign = (typeof TABLE_CELL_ALIGN_VALUES)[number]

export type TableNodeType = 'table' | 'table_row' | 'table_header' | 'table_cell'

export type TableCellNodeType = Extract<TableNodeType, 'table_header' | 'table_cell'>

export const TableExtension = Table.extend({
  content: 'table_row+',
})

export const TableRowExtension = TableRow.extend({
  name: 'table_row',
  content: '(table_cell | table_header)*',
})

export const TableHeaderExtension = TableHeader.extend({
  name: 'table_header',
  content: 'paragraph+',
})

export const TableCellExtension = TableCell.extend({
  name: 'table_cell',
  content: 'paragraph+',
})

export const TABLE_EXTENSIONS = [
  TableExtension,
  TableRowExtension,
  TableHeaderExtension,
  TableCellExtension,
]

export const TABLE_NODE_TYPES: ReadonlySet<TableNodeType> = new Set([
  'table',
  'table_row',
  'table_header',
  'table_cell',
])

export const TABLE_CELL_NODE_TYPES: ReadonlySet<TableCellNodeType> = new Set([
  'table_header',
  'table_cell',
])
