import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  BetweenHorizontalEnd,
  BetweenHorizontalStart,
  BetweenVerticalEnd,
  BetweenVerticalStart,
  Columns3,
  PanelLeft,
  PanelTop,
  Rows3,
  TableCellsMerge,
  TableCellsSplit,
  Trash2,
} from '@lucide/vue'
import type { TableCellAlign } from '@hikarinagi/editor-schema'
import type { EditorMenuItem } from '../menu/Floating.vue'
import type { TableAxis } from './commands'

export const TABLE_ALIGN_ITEMS: {
  id: string
  icon: EditorMenuItem['icon']
  label: string
  value: TableCellAlign | null
}[] = [
  { id: 'align-left', icon: AlignLeft, label: '左对齐', value: null },
  { id: 'align-center', icon: AlignCenter, label: '居中', value: 'center' },
  { id: 'align-right', icon: AlignRight, label: '右对齐', value: 'right' },
]

export function lineItems(axis: TableAxis): EditorMenuItem[] {
  return axis === 'column'
    ? [
        { id: 'insert-before', icon: BetweenVerticalStart, label: '在左侧插入列' },
        { id: 'insert-after', icon: BetweenVerticalEnd, label: '在右侧插入列' },
      ]
    : [
        { id: 'insert-before', icon: BetweenHorizontalStart, label: '在上方插入行' },
        { id: 'insert-after', icon: BetweenHorizontalEnd, label: '在下方插入行' },
      ]
}

export function headerItem(axis: TableAxis): EditorMenuItem {
  return axis === 'column'
    ? { id: 'header-column', icon: PanelLeft, label: '设为表头列' }
    : { id: 'header-row', icon: PanelTop, label: '设为表头行' }
}

export function cellItems(canMerge: boolean): EditorMenuItem[] {
  return canMerge
    ? [{ id: 'merge', icon: TableCellsMerge, label: '合并单元格' }]
    : [{ id: 'split', icon: TableCellsSplit, label: '拆分单元格' }]
}

export function deleteItem(axis: TableAxis): EditorMenuItem {
  return axis === 'column'
    ? { id: 'delete', icon: Columns3, label: '删除列', danger: true }
    : { id: 'delete', icon: Rows3, label: '删除行', danger: true }
}

export const DELETE_TABLE_ITEM: EditorMenuItem = {
  id: 'delete-table',
  icon: Trash2,
  label: '删除表格',
  danger: true,
}
