const STORE = 'hikari-reader-v1'
const BOOKS_KEY = 'hikari-reader-books'
const KEPT_BOOKS = 20

function storeOf() {
  if (typeof caches === 'undefined') return null
  return caches.open(STORE).catch(() => null)
}

function requestOf(path: string) {
  return new Request(new URL(`/__reader/${path}`, location.origin))
}

export async function readCached(path: string) {
  const store = await storeOf()
  const hit = await store?.match(requestOf(path)).catch(() => undefined)
  return hit ? hit.arrayBuffer() : null
}

export async function writeCached(path: string, bytes: ArrayBuffer) {
  const store = await storeOf()
  await store?.put(requestOf(path), new Response(bytes)).catch(() => undefined)
}

export async function touchBook(bookId: string) {
  let books: Record<string, number> = {}
  try {
    books = JSON.parse(localStorage.getItem(BOOKS_KEY) ?? '{}') as Record<string, number>
  } catch {
    books = {}
  }
  const ranked = Object.entries({ ...books, [bookId]: Date.now() }).sort((a, b) => b[1] - a[1])
  const stale = ranked.slice(KEPT_BOOKS).map(([id]) => id)
  try {
    localStorage.setItem(BOOKS_KEY, JSON.stringify(Object.fromEntries(ranked.slice(0, KEPT_BOOKS))))
  } catch {
    return
  }
  if (!stale.length) return
  const store = await storeOf()
  const keys = (await store?.keys().catch(() => [])) ?? []
  await Promise.all(
    keys
      .filter(key =>
        stale.some(id => new URL(key.url).pathname.startsWith(`/__reader/book/${id}/`)),
      )
      .map(key => store?.delete(key)),
  )
}
