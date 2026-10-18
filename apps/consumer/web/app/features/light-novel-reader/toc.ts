import type { Reader, TocEntry } from '@ritojs/core'

export interface TocRow {
  key: string
  entry: TocEntry
  label: string
  depth: number
  start: number | null
  pages: number | null
}

export function tocRows(reader: Reader, laid: boolean): TocRow[] {
  const rows: TocRow[] = []
  const walk = (entries: readonly TocEntry[], depth: number) => {
    for (const entry of entries) {
      rows.push({
        key: `${rows.length}:${entry.href}`,
        entry,
        label: entry.label.trim(),
        depth,
        start: laid ? (reader.findPage(entry) ?? null) : null,
        pages: null,
      })
      walk(entry.children, depth + 1)
    }
  }
  walk(reader.toc, 0)
  if (!laid) return rows
  return rows.map(row => {
    if (row.start == null) return row
    const next = rows.find(other => other.start != null && other.start > row.start!)
    return { ...row, pages: (next?.start ?? reader.pageCount) - row.start }
  })
}

export function rowAt(rows: readonly TocRow[], page: number) {
  let found: TocRow | undefined
  for (const row of rows) {
    if (row.start == null || row.start > page) continue
    if (!found || row.start >= found.start!) found = row
  }
  return found
}

export function spineIndexOf(reader: Reader, href: string | undefined) {
  if (!href) return undefined
  const index = [...reader.manifestHrefMap.values()].indexOf(href)
  return index < 0 ? undefined : index
}
