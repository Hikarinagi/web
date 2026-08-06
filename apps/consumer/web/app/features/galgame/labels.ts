import {
  GALGAME_DEV_STATUS_CN,
  ORIGIN_LANGUAGE_CODES,
  PRODUCER_ROLE_CN,
  PRODUCER_TYPE_CN,
  STAFF_ROLE_CN,
} from '@hikarinagi/shared'
import type { components } from '@hikarinagi/api-contract/v3'

export const LANGUAGE_LABELS = {
  ja: '日语',
  'zh-Hans': '简体中文',
  'zh-Hant': '繁体中文',
  en: '英语',
  ko: '韩语',
  ru: '俄语',
  fr: '法语',
  de: '德语',
  es: '西班牙语',
  it: '意大利语',
  'pt-br': '葡萄牙语(巴西)',
  'pt-pt': '葡萄牙语',
  pl: '波兰语',
  uk: '乌克兰语',
  vi: '越南语',
  th: '泰语',
  id: '印尼语',
  nl: '荷兰语',
  ar: '阿拉伯语',
  tr: '土耳其语',
} satisfies Record<string, string>

export type LanguageCode = keyof typeof LANGUAGE_LABELS

export const LANGUAGE_OPTIONS: { value: string; label: string }[] = ORIGIN_LANGUAGE_CODES.map(
  value => ({ value, label: LANGUAGE_LABELS[value] }),
)

export const DEV_STATUS_LABELS: Record<string, string> = GALGAME_DEV_STATUS_CN

export const RELATION_LABELS: Record<string, string> = {
  SEQUEL: '续作',
  PREQUEL: '前作',
  SIDE_STORY: '外传',
  MAIN_STORY: '主线故事',
  VARIANT: '不同版本',
  MAIN_VERSION: '主版本',
  COLLECTION: '合集',
  COLLECTED_WORK: '收录作品',
  SAME_UNIVERSE: '同一世界观',
  DIFFERENT_ADAPTATION: '不同改编',
  EXPANSION: '资料片',
}

export const PRODUCER_ROLE_LABELS: Record<string, string> = PRODUCER_ROLE_CN

export const PRODUCER_TYPE_LABELS: Record<string, string> = PRODUCER_TYPE_CN

export const STAFF_ROLE_LABELS = STAFF_ROLE_CN satisfies Record<
  components['schemas']['GalgameStaffRole'],
  string
>

export const CURRENCY_SYMBOL: Record<string, string> = {
  JPY: '¥',
  CNY: '¥',
  USD: '$',
  TWD: 'NT$',
  HKD: 'HK$',
  KRW: '₩',
}

export function langLabel(code: string | null | undefined): string {
  return (code && LANGUAGE_LABELS[code as LanguageCode]) || code || ''
}

export function devStatusLabel(code: string | null | undefined): string {
  return (code && DEV_STATUS_LABELS[code]) || code || ''
}

export function relationLabel(code: string | null | undefined): string {
  return (code && RELATION_LABELS[code]) || code || ''
}

export function producerRoleLabel(code: string | null | undefined): string {
  return (code && PRODUCER_ROLE_LABELS[code]) || code || ''
}

export function staffRoleLabel(code: string | null | undefined): string {
  return (code && STAFF_ROLE_LABELS[code as keyof typeof STAFF_ROLE_LABELS]) || code || ''
}
