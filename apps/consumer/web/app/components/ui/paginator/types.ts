import type { PageMeta } from '@hikarinagi/shared'

export type { PageMeta }

export type PaginatorRouteMode = boolean | 'push' | 'replace'

export interface PaginatorChangePayload {
  page: number
  page_size: number
  meta: PageMeta
  ready: Promise<void>
}

export type PaginatorCursor = Pick<PaginatorChangePayload, 'page' | 'page_size'>
export type PaginatorPageInput = number | Pick<PaginatorChangePayload, 'page' | 'ready'>
