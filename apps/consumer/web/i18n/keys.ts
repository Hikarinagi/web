import type { MessageKeyOf } from '@hikarinagi/shared'
import type { DATETIME_FORMATS } from './formats'
import type messages from './locales/zh-CN'

export type MessageKey = MessageKeyOf<typeof messages>
export type DateFormatKey = keyof (typeof DATETIME_FORMATS)['zh-CN']
