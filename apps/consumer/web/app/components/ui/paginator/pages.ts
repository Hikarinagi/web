import type { PageMeta } from './types'

export type PageToken = number | 'gap-start' | 'gap-end'

export function totalPagesOf(meta: PageMeta, pageSize = meta.page_size) {
  if (pageSize !== meta.page_size) return totalPagesFor(meta.total_items, pageSize)
  const total = meta.total_pages
  return Math.max(1, Number.isFinite(total) ? total : 1)
}

export function totalPagesFor(totalItems: number, pageSize: number) {
  return Math.max(1, Math.ceil(totalItems / Math.max(1, pageSize)))
}

export function clampPage(page: number, totalPages: number) {
  if (!Number.isFinite(page)) return 1
  return Math.min(Math.max(1, Math.trunc(page)), Math.max(1, totalPages))
}

export function pageTokens(current: number, total: number, siblings: number, boundaries: number) {
  const safeSiblings = Math.max(0, siblings)
  const safeBoundaries = Math.max(1, boundaries)
  const visible = safeBoundaries * 2 + safeSiblings * 2 + 3

  if (total <= visible) return range(1, total)

  const left = Math.max(
    Math.min(current - safeSiblings, total - safeBoundaries - safeSiblings * 2 - 1),
    safeBoundaries + 2,
  )
  const right = Math.min(
    Math.max(current + safeSiblings, safeBoundaries + safeSiblings * 2 + 2),
    total - safeBoundaries - 1,
  )
  const items: PageToken[] = [...range(1, safeBoundaries)]

  if (left > safeBoundaries + 2) {
    items.push('gap-start')
  } else {
    items.push(...range(safeBoundaries + 1, left - 1))
  }

  items.push(...range(left, right))

  if (right < total - safeBoundaries - 1) {
    items.push('gap-end')
  } else {
    items.push(...range(right + 1, total - safeBoundaries))
  }

  items.push(...range(total - safeBoundaries + 1, total))
  return items
}

function range(start: number, end: number) {
  if (end < start) return []
  return Array.from({ length: end - start + 1 }, (_, index) => start + index)
}
