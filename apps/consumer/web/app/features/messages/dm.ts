import type { ApiData } from '@hikarinagi/api-contract/v3'
import { TimeFormatEnum, datePartFormat, timeFormat } from '~/utils/time-format'

export type Conversation = ApiData<'/api/v3/user/me/conversations', 'get'>['items'][number]
export type MessageHistory = ApiData<'/api/v3/user/me/conversations/{peerId}/messages', 'get'>
export type DmMessage = MessageHistory['items'][number]
export type DmEmojiSet = MessageHistory['emoji_sets'][number]
export type DmAttachment = DmMessage['attachments'][number]
export type DmPeer = Conversation['peer']

export type ThreadMessage = DmMessage & { pending?: boolean; failed?: boolean }

export interface DmNewEvent {
  message: DmMessage
  peer: DmPeer
  emoji_sets: DmEmojiSet[]
}

export interface DmReadEvent {
  peer_id: number
  read_at: string
}

function nodeHasInline(node: unknown): boolean {
  if (!node || typeof node !== 'object') return false
  const n = node as { type?: string; text?: string; content?: unknown[] }
  if (n.type === 'text') return typeof n.text === 'string' && n.text.trim().length > 0
  if (n.type === 'emoji_inline') return true
  return Array.isArray(n.content) && n.content.some(nodeHasInline)
}

export function hasDoc(doc: DmMessage['content_json']): boolean {
  return nodeHasInline(doc)
}

export function messageExcerpt(m: { content: string; attachments: unknown[] }): string {
  if (m.content.trim()) return m.content.length > 60 ? `${m.content.slice(0, 60)}…` : m.content
  return m.attachments.length > 0 ? '[图片]' : '[表情]'
}

export function messageClock(iso: string): string {
  return timeFormat(iso, TimeFormatEnum.HH_MM)
}

export function dayLabel(iso: string): string {
  const date = new Date(iso)
  const now = new Date()
  if (date.toDateString() === now.toDateString()) return '今天'
  const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1)
  if (date.toDateString() === yesterday.toDateString()) return '昨天'
  return datePartFormat(iso)
}

export function sameDay(a: string, b: string): boolean {
  return new Date(a).toDateString() === new Date(b).toDateString()
}

const CLUSTER_MS = 180_000

function clustered(a: ThreadMessage, b: ThreadMessage): boolean {
  return (
    a.from_me === b.from_me && Math.abs(Date.parse(a.sent_at) - Date.parse(b.sent_at)) < CLUSTER_MS
  )
}

export function startsDay(list: ThreadMessage[], i: number): boolean {
  const cur = list[i]
  if (!cur) return false
  const older = list[i + 1]
  return !older || !sameDay(older.sent_at, cur.sent_at)
}

export function showsMeta(list: ThreadMessage[], i: number): boolean {
  const cur = list[i]
  const newer = list[i - 1]
  return !cur || !newer || !clustered(newer, cur)
}

export function isContinuation(list: ThreadMessage[], i: number): boolean {
  const cur = list[i]
  const older = list[i + 1]
  return !!cur && !!older && clustered(cur, older)
}
