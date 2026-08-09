import {
  Braces,
  Copy,
  Heading2,
  Heading3,
  Heading4,
  List,
  ListOrdered,
  Pilcrow,
  Quote,
  Trash2,
} from '@lucide/vue'
import type { Component } from 'vue'
import type { BlockConversion } from './commands'

export interface BlockConvertItem {
  id: string
  icon: Component
  label: string
  target: BlockConversion
}

export interface BlockActionItem {
  id: string
  icon: Component
  label: string
  danger?: boolean
}

export const BLOCK_CONVERT_ITEMS: BlockConvertItem[] = [
  { id: 'paragraph', icon: Pilcrow, label: '正文', target: { kind: 'paragraph' } },
  { id: 'h2', icon: Heading2, label: '标题 H2', target: { kind: 'heading', level: 2 } },
  { id: 'h3', icon: Heading3, label: '标题 H3', target: { kind: 'heading', level: 3 } },
  { id: 'h4', icon: Heading4, label: '标题 H4', target: { kind: 'heading', level: 4 } },
  { id: 'bullet-list', icon: List, label: '无序列表', target: { kind: 'bullet_list' } },
  { id: 'ordered-list', icon: ListOrdered, label: '有序列表', target: { kind: 'ordered_list' } },
  { id: 'blockquote', icon: Quote, label: '引用块', target: { kind: 'blockquote' } },
  { id: 'code-block', icon: Braces, label: '代码块', target: { kind: 'code_block' } },
]

export const BLOCK_ACTION_ITEMS: BlockActionItem[] = [
  { id: 'duplicate', icon: Copy, label: '创建副本' },
  { id: 'delete', icon: Trash2, label: '删除', danger: true },
]
