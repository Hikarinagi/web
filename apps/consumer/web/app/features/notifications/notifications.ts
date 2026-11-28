import type { ApiData } from '@hikarinagi/api-contract/v3'
import type { MessageKey } from '~~/i18n/keys'

export type SystemMessageItem = ApiData<'/api/v3/system-messages', 'get'>['items'][number]
export type SystemMessagePage = ApiData<'/api/v3/system-messages', 'get'>
export type SystemMessageDetail = ApiData<'/api/v3/system-messages/{id}', 'get'>
export type UnreadSummary = ApiData<'/api/v3/system-messages/unread/summary', 'get'>

export const MESSAGES_PAGE_SIZE = 20

export type MessageTab = 'all' | 'interaction' | 'notification' | 'system'

export const MESSAGE_TABS: {
  key: MessageTab
  label: MessageKey
  type?: 'INTERACTION' | 'NOTIFICATION' | 'SYSTEM'
}[] = [
  { key: 'all', label: 'inbox.tabs.all' },
  { key: 'interaction', label: 'inbox.tabs.interaction', type: 'INTERACTION' },
  { key: 'notification', label: 'common.section.notification', type: 'NOTIFICATION' },
  { key: 'system', label: 'inbox.tabs.system', type: 'SYSTEM' },
]
