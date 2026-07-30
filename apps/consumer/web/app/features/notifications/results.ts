import { MESSAGES_PAGE_SIZE, MESSAGE_TABS, type MessageTab } from './notifications'

export interface MessagesResultsState {
  type: MessageTab
  page: number
  page_size: number
}

const TAB_KEYS = MESSAGE_TABS.map(tab => tab.key)

function readString(value: unknown): string | undefined {
  const raw = Array.isArray(value) ? value[0] : value
  return typeof raw === 'string' ? raw : undefined
}

function readType(value: unknown): MessageTab {
  const raw = readString(value)
  return raw && TAB_KEYS.includes(raw as MessageTab) ? (raw as MessageTab) : 'all'
}

function readPage(value: unknown): number {
  const n = Number(readString(value))
  return Number.isInteger(n) && n > 0 ? n : 1
}

export function readMessagesQuery(query: Record<string, unknown>): MessagesResultsState {
  return {
    type: readType(query.type),
    page: readPage(query.page),
    page_size: MESSAGES_PAGE_SIZE,
  }
}

/** 该 tab 对应的后端 system-message type 过滤值;'all' 不过滤。 */
export function backendType(type: MessageTab) {
  return MESSAGE_TABS.find(tab => tab.key === type)?.type
}

function buildQuery(state: MessagesResultsState): string {
  const query = new URLSearchParams()
  if (state.type !== 'all') query.set('type', state.type)
  if (state.page > 1) query.set('page', String(state.page))
  return query.toString()
}

export function messagesBff(state: MessagesResultsState): `/api/pages/${string}` {
  const qs = buildQuery(state)
  return `/api/pages/messages${qs ? `?${qs}` : ''}` as `/api/pages/${string}`
}
