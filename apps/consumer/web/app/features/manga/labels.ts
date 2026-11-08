import {
  MANGA_AUDIENCE_CN,
  MANGA_PRODUCER_ROLE_CN,
  MANGA_READING_MODE_CN,
  MANGA_SERIAL_STATUS_CN,
  MANGA_STAFF_ROLE_CN,
} from '@hikarinagi/shared'
import type { components } from '@hikarinagi/api-contract/v3'

export const MANGA_SERIAL_STATUS_LABELS = MANGA_SERIAL_STATUS_CN satisfies Record<
  components['schemas']['MangaSerialStatus'],
  string
>

export const MANGA_STAFF_ROLE_LABELS = MANGA_STAFF_ROLE_CN satisfies Record<
  components['schemas']['MangaStaffRole'],
  string
>

export const MANGA_PRODUCER_ROLE_LABELS = MANGA_PRODUCER_ROLE_CN satisfies Record<
  components['schemas']['MangaProducerRole'],
  string
>

export const MANGA_READING_MODE_LABELS = MANGA_READING_MODE_CN satisfies Record<
  components['schemas']['MangaReadingMode'],
  string
>

export const MANGA_AUDIENCE_LABELS = MANGA_AUDIENCE_CN satisfies Record<
  components['schemas']['MangaAudience'],
  string
>

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
