export interface VolumeNumberSource {
  id: number
  volume_number: number | null
  name: string | null
  name_cn: string | null
  sort_key: number
  publication_date: string | Date | null
}

const NAME_PATTERNS: RegExp[] = [
  /[（(]\s*(\d{1,3})\s*[)）]/,
  /第\s*(\d{1,3})\s*[卷巻]/,
  /(?:^|[\s・:：-])(\d{1,3})\s*[卷巻]/,
  /\bvol(?:ume)?\.?\s*(\d{1,3})\b/i,
  /(?:^|[\s・:：-])(\d{1,3})(?:[\s・:：-]|$)/,
]

function parsed(entry: VolumeNumberSource): number | null {
  for (const name of [entry.name_cn, entry.name]) {
    const text = (name ?? '').normalize('NFKC').trim()
    if (!text) continue
    for (const pattern of NAME_PATTERNS) {
      const match = pattern.exec(text)
      if (match) return Number(match[1])
    }
  }
  return null
}

function halves(entry: VolumeNumberSource, total: number): number | null {
  const text = `${entry.name_cn ?? ''} ${entry.name ?? ''}`.normalize('NFKC')
  if (/[（(\s]上[)）\s]|上[卷巻]/.test(text)) return 1
  if (/[（(\s]中[)）\s]|中[卷巻]/.test(text)) return total === 3 ? 2 : null
  if (/[（(\s]下[)）\s]|下[卷巻]/.test(text)) return total
  return null
}

function time(value: string | Date | null): number {
  if (!value) return 0
  const stamp = value instanceof Date ? value.getTime() : Date.parse(value)
  return Number.isFinite(stamp) ? stamp : 0
}

function ordered<T extends VolumeNumberSource>(entries: T[]): T[] {
  return [...entries].sort(
    (a, b) =>
      a.sort_key - b.sort_key || time(a.publication_date) - time(b.publication_date) || a.id - b.id,
  )
}

export function volumeNumbers(entries: VolumeNumberSource[]): Map<number, number> {
  const list = ordered(entries)
  const numbers = new Map<number, number>()
  for (const entry of list) {
    const number = entry.volume_number ?? parsed(entry) ?? halves(entry, list.length)
    if (number !== null && !numbers.has(number)) numbers.set(number, entry.id)
  }
  if (numbers.size === 0) {
    list.forEach((entry, index) => numbers.set(index + 1, entry.id))
  }
  return numbers
}

export function volumeEntryFor(
  entries: VolumeNumberSource[],
  volumeNumber: number | null,
): number | null {
  if (volumeNumber === null) return null
  return volumeNumbers(entries).get(volumeNumber) ?? null
}

export function volumeNumberOf(entries: VolumeNumberSource[], entryId: number): number | null {
  for (const [number, id] of volumeNumbers(entries)) if (id === entryId) return number
  return null
}
