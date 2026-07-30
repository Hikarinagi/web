export function readPageQuery(query: Record<string, unknown>, key = 'page'): number {
  const raw = query[key]
  const value = Array.isArray(raw) ? raw[0] : raw
  if (typeof value !== 'number' && typeof value !== 'string') return 1

  const page = Number(value)
  return Number.isInteger(page) && page > 0 ? page : 1
}
