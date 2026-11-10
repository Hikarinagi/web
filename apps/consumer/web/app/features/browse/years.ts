export const FIRST_YEAR = 1900
export const LAST_YEAR = 2200

export interface YearRange {
  from: number
  to: number
}

export const BROWSE_DECADES: { label: string; from: number; to: number }[] = [
  { label: '2020 年代', from: 2020, to: 2029 },
  { label: '2010 年代', from: 2010, to: 2019 },
  { label: '2000 年代', from: 2000, to: 2009 },
  { label: '更早', from: FIRST_YEAR, to: 1999 },
]

export function span(from: number, to: number): number[] {
  return Array.from({ length: Math.max(0, to - from + 1) }, (_, index) => from + index)
}

export function yearRanges(years: number[]): YearRange[] {
  const ranges: YearRange[] = []
  for (const year of [...new Set(years)].sort((a, b) => a - b)) {
    const last = ranges.at(-1)
    if (last && year === last.to + 1) last.to = year
    else ranges.push({ from: year, to: year })
  }
  return ranges
}

export function rangeText(range: YearRange): string {
  if (range.from === range.to) return `${range.from} 年`
  if (range.from <= FIRST_YEAR) return `${range.to} 年以前`
  return `${range.from} 至 ${range.to} 年`
}

export function cleanYears(years: number[]): number[] {
  return [...new Set(years)]
    .filter(year => Number.isInteger(year) && year >= FIRST_YEAR && year <= LAST_YEAR)
    .sort((a, b) => a - b)
}

export function readYears(value: unknown): number[] {
  const raw = Array.isArray(value) ? value.join(',') : typeof value === 'string' ? value : ''
  const years: number[] = []
  for (const part of raw.split(',')) {
    const match = /^\s*(\d{4})(?:\s*-\s*(\d{4}))?\s*$/.exec(part)
    if (!match) continue
    const from = Number(match[1])
    const to = Number(match[2] ?? match[1])
    years.push(
      ...span(Math.max(Math.min(from, to), FIRST_YEAR), Math.min(Math.max(from, to), LAST_YEAR)),
    )
  }
  return cleanYears(years)
}

export function writeYears(years: number[]): string | undefined {
  const ranges = yearRanges(years)
  if (!ranges.length) return undefined
  return ranges
    .map(range => (range.from === range.to ? `${range.from}` : `${range.from}-${range.to}`))
    .join(',')
}
