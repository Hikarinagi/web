import type { components } from '@hikarinagi/api-contract/v3'

export const MANGA_SERIAL_STATUS_LABELS = {
  SERIALIZING: '连载中',
  FINISHED: '已完结',
  PAUSED: '暂停连载',
  ABANDONED: '中止连载',
} satisfies Record<components['schemas']['MangaSerialStatus'], string>

export const MANGA_STAFF_ROLE_LABELS = {
  AUTHOR: '作者',
  ART: '作画',
  ORIGINAL_CREATOR: '原作',
  SCRIPT: '脚本',
  ILLUSTRATION: '插图',
  CHARACTER_DESIGN: '人物原案',
} satisfies Record<components['schemas']['MangaStaffRole'], string>

export const MANGA_PRODUCER_ROLE_LABELS = {
  PUBLISHER: '出版社',
  MAGAZINE: '连载杂志',
  LABEL: '书系',
} satisfies Record<components['schemas']['MangaProducerRole'], string>

export const MANGA_READING_MODE_LABELS = {
  PAGED_RTL: '从右往左',
  PAGED_LTR: '从左往右',
  WEBTOON: '条漫（竖向滚动）',
} satisfies Record<components['schemas']['MangaReadingMode'], string>

export const MANGA_AUDIENCE_LABELS = {
  SHONEN: '少年',
  SEINEN: '青年',
  SHOJO: '少女',
  JOSEI: '女性',
} satisfies Record<components['schemas']['MangaAudience'], string>

export const MANGA_RELATION_LABELS = {
  SERIES: '系列',
  PREQUEL: '前作',
  SEQUEL: '续作',
  SIDE_STORY: '外传',
  MAIN_STORY: '主线故事',
  SAME_UNIVERSE: '同一世界观',
  DIFFERENT_UNIVERSE: '不同世界观',
  VARIANT: '不同版本',
  DIFFERENT_ADAPTATION: '不同改编',
  CHARACTER: '角色出演',
  COLLABORATION: '联动',
  OTHER: '相关',
} satisfies Record<components['schemas']['MangaRelationType'], string>

export function mangaSerialStatusLabel(value: string | null | undefined) {
  return (
    (value && MANGA_SERIAL_STATUS_LABELS[value as keyof typeof MANGA_SERIAL_STATUS_LABELS]) ||
    value ||
    ''
  )
}

export function mangaStaffRoleLabel(value: string | null | undefined) {
  return (
    (value && MANGA_STAFF_ROLE_LABELS[value as keyof typeof MANGA_STAFF_ROLE_LABELS]) || value || ''
  )
}

export function mangaProducerRoleLabel(value: string | null | undefined) {
  return (
    (value && MANGA_PRODUCER_ROLE_LABELS[value as keyof typeof MANGA_PRODUCER_ROLE_LABELS]) ||
    value ||
    ''
  )
}
