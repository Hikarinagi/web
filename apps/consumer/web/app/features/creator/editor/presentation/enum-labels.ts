import type { EditorSelectOption } from './types'
import { PRODUCER_RELATION_LABELS } from '~/features/entity/labels'
import {
  COVER_KIND_LABELS,
  DEV_STATUS_LABELS,
  LANGUAGE_LABELS,
  PRODUCER_ROLE_LABELS,
  PRODUCER_TYPE_LABELS,
  RELATION_LABELS,
  STAFF_ROLE_LABELS,
} from '~/features/galgame/labels'
import { CHARACTER_ROLE_LABELS, NOVEL_RELATION_LABELS, NOVEL_STATUS_LABELS } from '~/labels/work'
import {
  MANGA_AUDIENCE_LABELS,
  MANGA_PRODUCER_ROLE_LABELS,
  MANGA_READING_MODE_LABELS,
  MANGA_RELATION_LABELS,
  MANGA_SERIAL_STATUS_LABELS,
  MANGA_STAFF_ROLE_LABELS,
} from '~/features/manga/labels'

export const ENUM_LABELS: Record<string, Record<string, string>> = {
  GalgameCoverKind: COVER_KIND_LABELS,
  GalgameDevStatus: DEV_STATUS_LABELS,
  GalgameRelationType: RELATION_LABELS,
  GalgameStaffRole: STAFF_ROLE_LABELS,
  CharacterRole: CHARACTER_ROLE_LABELS,
  NovelStatus: NOVEL_STATUS_LABELS,
  NovelRelationType: NOVEL_RELATION_LABELS,
  ProducerRole: PRODUCER_ROLE_LABELS,
  ProducerRelationType: PRODUCER_RELATION_LABELS,
  ProducerType: PRODUCER_TYPE_LABELS,
  MangaSerialStatus: MANGA_SERIAL_STATUS_LABELS,
  MangaReadingMode: MANGA_READING_MODE_LABELS,
  MangaAudience: MANGA_AUDIENCE_LABELS,
  MangaProducerRole: MANGA_PRODUCER_ROLE_LABELS,
  MangaStaffRole: MANGA_STAFF_ROLE_LABELS,
  MangaRelationType: MANGA_RELATION_LABELS,
}

export function enumLabel(enumName: string | undefined, value: string): string {
  return (enumName && ENUM_LABELS[enumName]?.[value]) || value
}

export function enumOptions(
  enumName: string | undefined,
  values: readonly string[],
): EditorSelectOption[] {
  return values.map(value => ({ value, label: enumLabel(enumName, value) }))
}

export const LANGUAGE_OPTIONS: EditorSelectOption[] = Object.entries(LANGUAGE_LABELS).map(
  ([value, label]) => ({ value, label }),
)
