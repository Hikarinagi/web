import { getRouterParam, type H3Event } from 'h3'
import { fetchBackendData } from '../../../utils/backend-api'
import { definePageBffHandler } from '../../../utils/page-bff'

const PAGE_SIZE = 100
const MAX_PAGES = 10

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
  const id = Number(getRouterParam(event, 'id'))
  const query = (page: number) => ({ page, page_size: PAGE_SIZE, sort: 'recent' }) as const

  const [producer, galgames, light_novels, mangas, relations, contributors, collaborators] =
    await Promise.all([
      fetchBackendData(event, '/api/v3/producers/{id}', { path: { id } }),
      allPages(page =>
        fetchBackendData(event, '/api/v3/producers/{id}/galgames', {
          path: { id },
          query: query(page),
        }),
      ),
      allPages(page =>
        fetchBackendData(event, '/api/v3/producers/{id}/light-novels', {
          path: { id },
          query: query(page),
        }),
      ),
      fetchBackendData(event, '/api/v3/producers/{id}/mangas', {
        path: { id },
        query: { page: 1, page_size: PAGE_SIZE, sort: 'views' },
      }).catch(() => null),
      fetchBackendData(event, '/api/v3/producers/{id}/relations', { path: { id } }).catch(
        () => null,
      ),
      fetchBackendData(event, '/api/v3/producers/{id}/contributors', { path: { id } }),
      fetchBackendData(event, '/api/v3/producers/{id}/collaborators', { path: { id } }).catch(
        () => null,
      ),
    ])

  return { producer, galgames, light_novels, mangas, relations, contributors, collaborators }
}

export type ProducerPageData = Awaited<ReturnType<typeof handler>>
export default definePageBffHandler(handler, {
  mergedRedirect: id => `/producers/${id}`,
})
