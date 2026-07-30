import type { ApiData } from '@hikarinagi/api-contract/v3'

export type SystemMessageItem = ApiData<'/api/v3/system-messages', 'get'>['items'][number]
export type SystemMessagePage = ApiData<'/api/v3/system-messages', 'get'>
export type SystemMessageDetail = ApiData<'/api/v3/system-messages/{id}', 'get'>
export type UnreadSummary = ApiData<'/api/v3/system-messages/unread/summary', 'get'>

export const MESSAGES_PAGE_SIZE = 20

export type MessageTab = 'all' | 'interaction' | 'notification' | 'system'

export const MESSAGE_TABS: {
  key: MessageTab
  label: string
  type?: 'INTERACTION' | 'NOTIFICATION' | 'SYSTEM'
}[] = [
  { key: 'all', label: '全部' },
  { key: 'interaction', label: '互动', type: 'INTERACTION' },
  { key: 'notification', label: '通知', type: 'NOTIFICATION' },
  { key: 'system', label: '系统', type: 'SYSTEM' },
]
