import { zhCN } from './zh-CN'

export type MessagesOf<T> = {
  readonly [K in keyof T]: T[K] extends string ? string : MessagesOf<T[K]>
}

export type MessageKeyOf<T> = {
  [K in keyof T & string]: T[K] extends string ? K : `${K}.${MessageKeyOf<T[K]>}`
}[keyof T & string]

export const SHARED_MESSAGES = { 'zh-CN': zhCN } satisfies Record<string, MessagesOf<typeof zhCN>>

export type SharedLocale = keyof typeof SHARED_MESSAGES

export const DEFAULT_LOCALE: SharedLocale = 'zh-CN'
