const VISITOR_KEY = 'hikari:visitor'
const RECENT_LIMIT = 3

export type RecommendKind = 'galgame' | 'light_novel' | 'manga'

function read(storage: Storage, key: string) {
  try {
    return storage.getItem(key)
  } catch {
    return null
  }
}

function write(storage: Storage, key: string, value: string) {
  try {
    storage.setItem(key, value)
  } catch {
    /* empty */
  }
}

export function visitorId(): string | undefined {
  const stored = read(localStorage, VISITOR_KEY)
  if (stored) return stored
  const created = crypto.randomUUID()
  write(localStorage, VISITOR_KEY, created)
  return read(localStorage, VISITOR_KEY) ?? undefined
}

function recentKey(kind: RecommendKind) {
  return `hikari:recent:${kind}`
}

export function recentWorks(kind: RecommendKind, current: number): number[] {
  const stored = read(sessionStorage, recentKey(kind))
  const list = stored ? (JSON.parse(stored) as number[]) : []
  return list.filter(id => id !== current).slice(0, RECENT_LIMIT - 1)
}

export function pushRecent(kind: RecommendKind, id: number) {
  write(
    sessionStorage,
    recentKey(kind),
    JSON.stringify([id, ...recentWorks(kind, id)].slice(0, RECENT_LIMIT)),
  )
}

function clickKey(kind: RecommendKind, id: number) {
  return `hikari:recommended:${kind}:${id}`
}

export function markRecommended(kind: RecommendKind, id: number) {
  write(sessionStorage, clickKey(kind, id), '1')
}

export function takeRecommended(kind: RecommendKind, id: number) {
  const key = clickKey(kind, id)
  const marked = read(sessionStorage, key) === '1'
  if (marked) sessionStorage.removeItem(key)
  return marked
}
