import type { ValueDraft } from './draft'

type Precision = 'YEAR' | 'MONTH' | 'DAY'

export type QualifierKind = 'period' | 'version' | 'part' | 'language'
export type ExtraKind = 'reading' | 'song' | 'archive'

export function extrasSet(value: ValueDraft): ExtraKind[] {
  return [
    ...(value.reading !== null ? (['reading'] as const) : []),
    ...(value.song !== null || value.song_kind !== null ? (['song'] as const) : []),
    ...(value.archive_url !== null ? (['archive'] as const) : []),
  ]
}

export function qualifiersSet(value: ValueDraft): QualifierKind[] {
  return [
    ...(value.period_from || value.period_to ? (['period'] as const) : []),
    ...(value.versions.length ? (['version'] as const) : []),
    ...(value.part ? (['part'] as const) : []),
    ...(value.language ? (['language'] as const) : []),
  ]
}

export function mediaDraft(media: {
  id: number
  src: string
  width?: number | null
  height?: number | null
  thumb_hash?: string | null
}): NonNullable<ValueDraft['media']> {
  return {
    id: media.id,
    src: media.src,
    width: media.width ?? null,
    height: media.height ?? null,
    thumb_hash: media.thumb_hash ?? null,
    sexual: null,
    violence: null,
  }
}

export const SEXUAL_LEVELS = ['安全', '暗示', '露骨'] as const
export const VIOLENCE_LEVELS = ['无', '暴力', '血腥'] as const

const pad = (value: number) => String(value).padStart(2, '0')

export function dateInput(date: string | null, precision: Precision | null): string {
  if (!date) return ''
  if (!precision) return date
  const [year, month, day] = date.split('-')
  if (precision === 'YEAR') return year ?? ''
  if (precision === 'MONTH') return `${year}-${month}`
  return `${year}-${month}-${day}`
}

export function parseDate(text: string): { date: string | null; precision: Precision | null } {
  const raw = text.trim()
  if (!raw) return { date: null, precision: null }
  const match = /^(\d{4})(?:[-/.年](\d{1,2})月?(?:[-/.](\d{1,2})日?|(\d{1,2})日)?)?$/.exec(raw)
  if (!match) return { date: raw, precision: null }
  const year = Number(match[1])
  const month = match[2] ? Number(match[2]) : null
  const day = (match[3] ?? match[4]) ? Number(match[3] ?? match[4]) : null
  if (month === null) return { date: `${year}-01-01`, precision: 'YEAR' }
  if (month < 1 || month > 12) return { date: raw, precision: null }
  if (day === null) return { date: `${year}-${pad(month)}-01`, precision: 'MONTH' }
  const value = new Date(Date.UTC(year, month - 1, day))
  if (value.getUTCMonth() !== month - 1) return { date: raw, precision: null }
  return { date: `${year}-${pad(month)}-${pad(day)}`, precision: 'DAY' }
}
