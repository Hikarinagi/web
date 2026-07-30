export function yearOf(date: string | null | undefined): string | null {
  if (!date) return null
  const y = new Date(date).getFullYear()
  return Number.isFinite(y) ? String(y) : null
}

export function joinMeta(parts: Array<string | null | undefined>): string | null {
  const cleaned = parts.filter((p): p is string => typeof p === 'string' && p.length > 0)
  return cleaned.length > 0 ? cleaned.join(' · ') : null
}
