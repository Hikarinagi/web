import type { PageMeta } from './types'

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
