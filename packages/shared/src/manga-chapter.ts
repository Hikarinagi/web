import { mangaSetKey, type MangaVolumeSetRef } from './manga-volume'

export type MangaChapterKind = 'SERIALIZATION' | 'EXTRA' | 'ONESHOT' | 'VOLUME'

export type MangaReadingUnit = 'chapter' | 'volume' | 'extra'

export interface MangaChapterParts {
  held: number[]
  count: number
}

export interface MangaChapterLabelSource {
  chapter_type: MangaChapterKind
  chapter_number: string | null
  volume_number: number | null
  title: string | null
  ordinal?: number | null
  parts?: MangaChapterParts | null
  volume_set?: MangaVolumeSetRef | null
}

export interface MangaChapterOrderSource {
  id: number
  chapter_type: MangaChapterKind
  chapter_number: string | null
  volume_number: number | null
  sort_key: number
  volume_set?: Pick<MangaVolumeSetRef, 'id' | 'original'> | null
}

export const MANGA_READING_UNITS: readonly MangaReadingUnit[] = ['chapter', 'volume', 'extra']

export const MANGA_READING_UNIT_NAME: Record<MangaReadingUnit, string> = {
  chapter: '单话',
  volume: '单行本',
  extra: '番外',
}

export const MANGA_READING_UNIT_NOUN: Record<MangaReadingUnit, string> = {
  chapter: '话',
  volume: '卷',
  extra: '篇',
}

export function mangaReadingUnit(type: MangaChapterKind): MangaReadingUnit {
  if (type === 'VOLUME') return 'volume'
  if (type === 'EXTRA') return 'extra'
  return 'chapter'
}

export function mangaChapterNumber(value: string): string {
  const text = value.trim()
  const match = /^0*(\d+)(\.\d+)?$/.exec(text)
  return match ? `${match[1]}${match[2] ?? ''}` : text
}

function suffix(ordinal: number | null | undefined): string {
  return ordinal && ordinal > 1 ? `（${ordinal}）` : ''
}

export function mangaPartsLabel(parts: MangaChapterParts): string {
  const first = parts.held[0]
  const last = parts.held[parts.held.length - 1]
  const held =
    parts.held.length > 1 && last - first + 1 === parts.held.length
      ? `${first} 至 ${last}`
      : parts.held.join('、')
  return `第 ${held} 册，共 ${parts.count} 册`
}

export function mangaChapterLabel(item: MangaChapterLabelSource): string {
  const title = item.title?.trim()
  const unit = mangaReadingUnit(item.chapter_type)
  if (unit === 'volume') {
    const set = item.volume_set && !item.volume_set.original ? `${item.volume_set.name} ` : ''
    const tail = `${suffix(item.ordinal)}${item.parts ? `（${mangaPartsLabel(item.parts)}）` : ''}`
    if (item.volume_number != null) return `${set}第 ${item.volume_number} 卷${tail}`
    return `${set}${title || '单行本'}${tail}`
  }
  if (unit === 'chapter' && item.chapter_number) {
    return `第 ${mangaChapterNumber(item.chapter_number)} 话${suffix(item.ordinal)}`
  }
  return `${title || '番外'}${suffix(item.ordinal)}`
}

export function mangaChapterHeading(item: MangaChapterLabelSource): string {
  const label = mangaChapterLabel(item)
  const title = item.title?.trim()
  if (!title || mangaReadingUnit(item.chapter_type) === 'extra') return label
  if (mangaChapterLabel({ ...item, volume_set: null }).startsWith(title)) return label
  return `${label} · ${title}`
}

function numeric(value: string | null): number {
  const parsed = value === null ? Number.NaN : Number.parseFloat(value)
  return Number.isFinite(parsed) ? parsed : Number.POSITIVE_INFINITY
}

function within(a: number, b: number): number {
  if (a === b) return 0
  return a < b ? -1 : 1
}

export function mangaChapterCompare(
  a: MangaChapterOrderSource,
  b: MangaChapterOrderSource,
): number {
  const unitA = mangaReadingUnit(a.chapter_type)
  const unitB = mangaReadingUnit(b.chapter_type)
  if (unitA !== unitB) {
    return MANGA_READING_UNITS.indexOf(unitA) - MANGA_READING_UNITS.indexOf(unitB)
  }
  const primary =
    unitA === 'chapter'
      ? within(numeric(a.chapter_number), numeric(b.chapter_number))
      : unitA === 'volume'
        ? within(mangaSetKey(a), mangaSetKey(b)) ||
          within(
            a.volume_number ?? Number.POSITIVE_INFINITY,
            b.volume_number ?? Number.POSITIVE_INFINITY,
          )
        : 0
  return primary || within(a.sort_key, b.sort_key) || a.id - b.id
}

function ordinalKey(item: MangaChapterOrderSource & { title: string | null }): string {
  const unit = mangaReadingUnit(item.chapter_type)
  if (unit === 'chapter' && item.chapter_number) {
    return `chapter:${mangaChapterNumber(item.chapter_number)}`
  }
  if (unit === 'volume' && item.volume_number != null)
    return `volume:${mangaSetKey(item)}:${item.volume_number}`
  return `${unit}:title:${item.title?.trim() ?? ''}`
}

export function mangaChapterOrdinals(
  items: (MangaChapterOrderSource & { title: string | null })[],
): Map<number, number> {
  const counts = new Map<string, number>()
  const ordinals = new Map<number, number>()
  for (const item of [...items].sort(mangaChapterCompare)) {
    const key = ordinalKey(item)
    const ordinal = (counts.get(key) ?? 0) + 1
    counts.set(key, ordinal)
    ordinals.set(item.id, ordinal)
  }
  return ordinals
}

function escaped(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export function mangaChapterTitle(
  raw: string | null | undefined,
  item: Pick<MangaChapterLabelSource, 'chapter_type' | 'chapter_number' | 'volume_number'>,
): string | null {
  const text = raw?.trim()
  if (!text) return null
  const unit = mangaReadingUnit(item.chapter_type)
  if (unit === 'extra') return text
  const number =
    unit === 'volume'
      ? item.volume_number === null
        ? null
        : String(item.volume_number)
      : item.chapter_number
  if (number === null) return text
  const digits = escaped(mangaChapterNumber(number))
  const label = new RegExp(
    `^(?:(?:第\\s*)?0*${digits}\\s*(?:话|話|回|卷|巻|集)?|(?:ch(?:apter)?|ep|vol(?:ume)?)\\.?\\s*0*${digits})$`,
    'i',
  )
  return label.test(text.normalize('NFKC').replace(/\s+/g, ' ')) ? null : text
}
