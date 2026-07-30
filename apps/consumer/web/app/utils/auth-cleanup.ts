const handlers = new Set<() => void>()

export function onAuthChange(fn: () => void): () => void {
  handlers.add(fn)
  return () => handlers.delete(fn)
}

export function emitAuthChange(): void {
  for (const fn of handlers) fn()
}
