import { getRouterParam, type H3Event } from 'h3'
import { fetchBackendData } from '../../../../utils/backend-api'
import { definePageBffHandler } from '../../../../utils/page-bff'

async function handler(event: H3Event) {
  const id = Number(getRouterParam(event, 'id'))

  const [
    manga,
    chapters,
    volumes,
    people,
    producers,
    my_rate,
    progress,
    favorite,
    rates,
    statistics,
  ] = await Promise.all([
    fetchBackendData(event, '/api/v3/mangas/{id}', { path: { id } }),
    fetchBackendData(event, '/api/v3/mangas/{id}/chapters', { path: { id } }),
    fetchBackendData(event, '/api/v3/mangas/{id}/volumes', { path: { id } }),
    fetchBackendData(event, '/api/v3/mangas/{id}/people', { path: { id } }),
    fetchBackendData(event, '/api/v3/mangas/{id}/producers', { path: { id } }),
    fetchBackendData(event, '/api/v3/mangas/{id}/rate', { path: { id } }).catch(() => null),
    fetchBackendData(event, '/api/v3/reader/mangas/{manga_id}/progress', {
      path: { manga_id: id },
    }).catch(() => null),
    fetchBackendData(event, '/api/v3/user/me/favorite/mangas/{manga_id}', {
      path: { manga_id: id },
    }).catch(() => null),
    fetchBackendData(event, '/api/v3/mangas/{id}/rates', {
      path: { id },
      query: { page: 1, page_size: 20, sort: 'hot' },
    }),
    fetchBackendData(event, '/api/v3/mangas/{id}/rates/statistics', { path: { id } }),
  ])

  return {
    manga,
    chapters,
    volumes,
    people,
    producers,
    my_rate,
    progress,
    favorite,
    rates,
    statistics,
  }
}

export type MangaRatesPageData = Awaited<ReturnType<typeof handler>>
export default definePageBffHandler(handler)
