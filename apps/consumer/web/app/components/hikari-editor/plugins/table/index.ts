import { Table as TableIcon } from '@lucide/vue'
import {
  TABLE_CELL_MIN_WIDTH,
  TableCellExtension,
  TableExtension,
  TableHeaderExtension,
  TableRowExtension,
} from '@hikarinagi/editor-schema'
import type { Editor } from '@tiptap/core'
import type { EditorPlugin } from '../types'
import { HikariTableView } from '../../table/view'
import { cellPastePlugin } from './paste'

const Table = TableExtension.extend({
  addProseMirrorPlugins() {
    return [...(this.parent?.() ?? []), cellPastePlugin()]
  },
})

export function insertTable(editor: Editor) {
  if (editor.isActive('table')) return
  editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
}

export const table: EditorPlugin = {
  id: 'table',
  group: 'insert-media',
  order: 3,
  extensions: () => [
    Table.configure({
      resizable: true,
      lastColumnResizable: false,
      cellMinWidth: TABLE_CELL_MIN_WIDTH,
      View: HikariTableView,
    }),
    TableRowExtension,
    TableHeaderExtension,
    TableCellExtension,
  ],
  toolbarItem: {
    icon: TableIcon,
    tooltip: '插入表格',
    isActive: editor => editor.isActive('table'),
    isDisabled: editor => editor.isActive('table'),
    onClick: insertTable,
  },
}
