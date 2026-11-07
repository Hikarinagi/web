import type { H3Event } from 'h3'
import { fetchBackendData } from '../../../utils/backend-api'
import { definePageBffHandler } from '../../../utils/page-bff'
import { readId } from '../../../utils/page-query'

const PAGE_SIZE = 100
const MAX_PAGES = 4

async function allPages<TItem, TMeta extends { total_items: number }>(
  fetchPage: (page: number) => Promise<{ items: TItem[]; meta: TMeta }>,
) {
  const first = await fetchPage(1).catch(() => null)
  if (!first) return null
  const pages = Math.min(Math.ceil(first.meta.total_items / PAGE_SIZE), MAX_PAGES)
  const rest = await Promise.all(
    Array.from({ length: Math.max(pages - 1, 0) }, (_, index) => fetchPage(index + 2)),
  )
  return { items: [first, ...rest].flatMap(page => page.items), meta: first.meta }
}

async function handler(event: H3Event) {
  const id = readId(event)
  const query = (page: number) => ({ page, page_size: PAGE_SIZE, sort: 'recent' }) as const

  const [person, galgames, light_novels, mangas, characters, contributors] = await Promise.all([
    fetchBackendData(event, '/api/v3/people/{id}', { path: { id } }),
    allPages(page =>
      fetchBackendData(event, '/api/v3/people/{id}/galgames', { path: { id }, query: query(page) }),
    ),
    allPages(page =>
      fetchBackendData(event, '/api/v3/people/{id}/light-novels', {
        path: { id },
        query: query(page),
      }),
    ),
    allPages(page =>
      fetchBackendData(event, '/api/v3/people/{id}/mangas', { path: { id }, query: query(page) }),
    ),
    allPages(page =>
      fetchBackendData(event, '/api/v3/people/{id}/characters', {
        path: { id },
        query: query(page),
      }),
    ),
    fetchBackendData(event, '/api/v3/people/{id}/contributors', { path: { id } }),
  ])

  return { person, galgames, light_novels, mangas, characters, contributors }
}

export type PeoplePageData = Awaited<ReturnType<typeof handler>>
export default definePageBffHandler(handler, {
  mergedRedirect: id => `/people/${id}`,
})
