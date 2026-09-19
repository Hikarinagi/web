export const REDACTED = '<redacted>'

export const DEFAULT_QUERY_ALLOW_LIST: readonly string[] = [
  'page',
  'page_size',
  'kind',
  'sort',
  'order',
  'status',
  'id',
  'ids',
  'type',
  'genre',
  'limit',
  'offset',
  'tab',
]

const MAX_STACK_BYTES = 16 * 1024

export function redactQuery(query: string, allow: readonly string[]): string {
  const trimmed = query.startsWith('?') ? query.slice(1) : query
  if (!trimmed) return ''
  const allowed = new Set(allow.map(key => key.toLowerCase()))
  return trimmed
    .split('&')
    .map(pair => {
      const cut = pair.indexOf('=')
      if (cut < 0) return pair
      const key = pair.slice(0, cut)
      return allowed.has(key.toLowerCase()) ? pair : `${key}=${REDACTED}`
    })
    .join('&')
}

export function truncate(value: string, maxBytes = MAX_STACK_BYTES): string {
  if (value.length <= maxBytes) return value
  return `${value.slice(0, maxBytes)}…`
}

export function pathOf(url: string, base?: string): { path: string; query: string } {
  try {
    const parsed = new URL(url, base ?? 'http://localhost')
    return { path: parsed.pathname, query: parsed.search }
  } catch {
    const cut = url.indexOf('?')
    return cut < 0 ? { path: url, query: '' } : { path: url.slice(0, cut), query: url.slice(cut) }
  }
}
