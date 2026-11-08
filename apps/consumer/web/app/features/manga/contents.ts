import type { ApiData } from '@hikarinagi/api-contract/v3'
import {
  MANGA_READING_UNITS,
  mangaChapterLabel,
  mangaChapterNumber,
  mangaReadingUnit,
  type MangaReadingUnit,
} from '@hikarinagi/shared'

export type ContentsItem = ApiData<'/api/v3/mangas/{id}/chapters', 'get'>[number]
export type ContentsProgress = NonNullable<
  ApiData<'/api/v3/reader/mangas/{manga_id}/progress', 'get'>
>
export type ContentsUnits = Record<MangaReadingUnit, ContentsItem[]>
export type ContentsVariant = 'page' | 'drawer' | 'sheet'

export interface ContentsRange {
  key: string
  label: string
}

export type ContentsCell =
  { kind: 'item'; key: string; item: ContentsItem } | { kind: 'gap'; key: string; number: number }

export const CONTENTS_RANGE_SIZE = 100
export const CONTENTS_NEW_MS = 7 * 24 * 60 * 60 * 1000

export function contentsUnits(items: ContentsItem[]): ContentsUnits {
  const units: ContentsUnits = { chapter: [], volume: [], extra: [] }
  for (const item of items) {
    if (item.readable) units[mangaReadingUnit(item.chapter_type)].push(item)
  }
  return units
}

export function contentsUnitOf(units: ContentsUnits, id: number | null | undefined) {
  if (id == null) return null
  return MANGA_READING_UNITS.find(unit => units[unit].some(item => item.id === id)) ?? null
}

export function defaultUnit(units: ContentsUnits, progressId: number | null | undefined) {
  return (
    contentsUnitOf(units, progressId) ??
    MANGA_READING_UNITS.find(unit => units[unit].length > 0) ??
    'chapter'
  )
}

export function chapterValue(item: Pick<ContentsItem, 'chapter_number'>): number {
  const value = Number.parseFloat(item.chapter_number ?? '')
  return Number.isFinite(value) ? value : Number.POSITIVE_INFINITY
}

export function rangeIndex(value: number): number {
  if (!Number.isFinite(value)) return Number.POSITIVE_INFINITY
  return value <= CONTENTS_RANGE_SIZE ? 0 : Math.ceil(value / CONTENTS_RANGE_SIZE) - 1
}

export function chapterRanges(chapters: ContentsItem[]): ContentsRange[] {
  if (chapters.length <= CONTENTS_RANGE_SIZE) return []
  const top = Math.max(
    ...chapters
      .map(chapterValue)
      .filter(Number.isFinite)
      .map(value => Math.floor(value)),
  )
  const count = Math.max(1, rangeIndex(top) + 1)
  return Array.from({ length: count }, (_, index) => ({
    key: String(index),
    label: `${index * CONTENTS_RANGE_SIZE + 1}–${Math.min((index + 1) * CONTENTS_RANGE_SIZE, top)}`,
  }))
}

export function rangeOfItem(item: ContentsItem, ranges: ContentsRange[]): string | null {
  if (!ranges.length) return null
  const index = rangeIndex(chapterValue(item))
  return ranges[Math.min(index, ranges.length - 1)]?.key ?? null
}

export function chapterCells(chapters: ContentsItem[], range: string | null): ContentsCell[] {
  const finite = chapters.map(chapterValue).filter(Number.isFinite)
  const whole = new Set(finite.filter(Number.isInteger))
  const first = finite.length ? Math.ceil(Math.min(...finite)) : 0
  const last = finite.length ? Math.floor(Math.max(...finite)) : -1
  const cells: ContentsCell[] = []
  let next = first
  for (const item of chapters) {
    const value = chapterValue(item)
    while (next < value && next <= last) {
      if (!whole.has(next)) cells.push({ kind: 'gap', key: `gap-${next}`, number: next })
      next += 1
    }
    cells.push({ kind: 'item', key: `item-${item.id}`, item })
    if (Number.isInteger(value)) next = Math.max(next, value + 1)
  }
  if (range === null) return cells
  const index = Number(range)
  const lastRange = Math.max(0, chapterRanges(chapters).length - 1)
  return cells.filter(
    cell =>
      Math.min(
        rangeIndex(cell.kind === 'gap' ? cell.number : chapterValue(cell.item)),
        lastRange,
      ) === index,
  )
}

export function continueTarget(
  units: ContentsUnits,
  progress: ContentsProgress | null | undefined,
  readIds: ReadonlySet<number>,
): { id: number; label: string; resume: boolean } | null {
  if (!progress) {
    const first = MANGA_READING_UNITS.map(unit => units[unit][0]).find(Boolean)
    return first ? { id: first.id, label: mangaChapterLabel(first), resume: false } : null
  }
  const unit = contentsUnitOf(units, progress.chapter.id)
  if (!unit) {
    return { id: progress.chapter.id, label: mangaChapterLabel(progress.chapter), resume: true }
  }
  const list = units[unit]
  const index = list.findIndex(item => item.id === progress.chapter.id)
  const current = list[index]!
  const target = readIds.has(current.id) ? (list[index + 1] ?? current) : current
  return { id: target.id, label: mangaChapterLabel(target), resume: true }
}

export function contentsStatus(units: ContentsUnits, finished: boolean): string | null {
  const unit = units.chapter.length ? 'chapter' : units.volume.length ? 'volume' : null
  if (!unit) return null
  const last = units[unit].at(-1)!
  if (finished) {
    return unit === 'chapter'
      ? `全 ${mangaChapterNumber(last.chapter_number ?? '')} 话`
      : `全 ${last.volume_number ?? units.volume.length} 卷`
  }
  return `更新至 ${mangaChapterLabel({ ...last, ordinal: 1 })}`
}

export function isNewItem(item: ContentsItem, readIds: ReadonlySet<number>, now = Date.now()) {
  return !readIds.has(item.id) && now - Date.parse(item.created_at) < CONTENTS_NEW_MS
}
