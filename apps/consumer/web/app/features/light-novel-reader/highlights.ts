import type { ApiData } from '@hikarinagi/api-contract/v3'
import type { ReaderAnnotationTarget, ReaderSourceRange } from '@ritojs/core'
import type { AnnotationRecord } from '@ritojs/kit'

export type ReaderAnnotation = ApiData<
  '/api/v3/reader/volumes/{volume_id}/annotations',
  'get'
>[number]

export const HIGHLIGHT_COLORS = [
  { value: 'rgba(250, 204, 21, 0.35)', swatch: '#facc15', label: '黄色', legacy: '#ffe58f' },
  { value: 'rgba(74, 222, 128, 0.35)', swatch: '#4ade80', label: '绿色', legacy: '#b7eb8f' },
  { value: 'rgba(96, 165, 250, 0.35)', swatch: '#60a5fa', label: '蓝色', legacy: '#91d5ff' },
  { value: 'rgba(244, 114, 182, 0.35)', swatch: '#f472b6', label: '粉色', legacy: '#ffa39e' },
  { value: 'rgba(167, 139, 250, 0.35)', swatch: '#a78bfa', label: '紫色', legacy: '#d3adf7' },
] as const

const compact = (value: string) => value.replace(/\s+/g, '').toLowerCase()

export function highlightColor(stored: string | null | undefined): string {
  const value = compact(stored ?? '')
  const known = HIGHLIGHT_COLORS.find(
    item => compact(item.value) === value || item.legacy === value,
  )
  if (known) return known.value
  if (value.startsWith('rgba(')) return stored!.trim()
  const hex = /^#([0-9a-f]{6})$/.exec(value)?.[1]
  if (!hex) return HIGHLIGHT_COLORS[0].value
  const [red, green, blue] = [0, 2, 4].map(at => Number.parseInt(hex.slice(at, at + 2), 16))
  return `rgba(${red}, ${green}, ${blue}, 0.35)`
}

export function isTarget(value: unknown): value is ReaderAnnotationTarget {
  return !!value && typeof value === 'object' && (value as { version?: unknown }).version === 1
}

export function legacyRange(
  value: unknown,
): { href: string; sourceRange: ReaderSourceRange } | null {
  const old = value as {
    href?: unknown
    selectors?: { sourceRange?: { start?: unknown; end?: unknown } }
  } | null
  const range = old?.selectors?.sourceRange
  if (typeof old?.href !== 'string' || !range?.start || !range.end) return null
  return {
    href: old.href,
    sourceRange: { start: range.start, end: range.end } as ReaderSourceRange,
  }
}

export function groupByChapter<T extends { target: ReaderAnnotationTarget | null }>(
  items: readonly T[],
  spineOf: (href: string) => number | undefined,
  chapters: readonly { label: string; href: string }[],
) {
  const marks: { label: string; spine: number }[] = []
  for (const chapter of chapters) {
    const spine = spineOf(chapter.href.split('#')[0]!)
    if (spine != null && !marks.some(mark => mark.spine === spine))
      marks.push({ label: chapter.label, spine })
  }
  marks.sort((a, b) => a.spine - b.spine)
  const placed = items
    .flatMap(item =>
      item.target
        ? [
            {
              item,
              spine: spineOf(item.target.href) ?? Infinity,
              start: item.target.position.start,
            },
          ]
        : [],
    )
    .sort((a, b) => a.spine - b.spine || a.start - b.start)
  const groups: { label: string; items: T[] }[] = []
  for (const { item, spine } of placed) {
    const label = marks.filter(mark => mark.spine <= spine).at(-1)?.label ?? ''
    const last = groups.at(-1)
    if (last && last.label === label) last.items.push(item)
    else groups.push({ label, items: [item] })
  }
  return groups
}

export function toMarkdown(
  title: string,
  groups: readonly { label: string; items: readonly { quote: string; note: string }[] }[],
) {
  const sections = groups.map(group => {
    const items = group.items.map(item => {
      const quote = item.quote
        .split('\n')
        .map(line => `> ${line}`)
        .join('\n')
      return item.note ? `${quote}\n\n${item.note}` : quote
    })
    return [`## ${group.label || '未命名章节'}`, ...items].join('\n\n')
  })
  return [`# ${title}`, ...sections].join('\n\n') + '\n'
}

export interface SyncedHighlight {
  color: string
  note: string
}

export function diffRecords(
  synced: ReadonlyMap<string, SyncedHighlight>,
  records: readonly AnnotationRecord[],
) {
  const created: AnnotationRecord[] = []
  const changed: { record: AnnotationRecord; color?: string; note?: string }[] = []
  for (const record of records) {
    const before = synced.get(record.id)
    if (!before) {
      created.push(record)
      continue
    }
    const color = record.color ?? before.color
    const note = record.note ?? ''
    if (color === before.color && note === before.note) continue
    changed.push({
      record,
      ...(color === before.color ? {} : { color }),
      ...(note === before.note ? {} : { note }),
    })
  }
  const present = new Set(records.map(record => record.id))
  const removed = [...synced.keys()].filter(id => !present.has(id))
  return { created, changed, removed }
}
