import { getRouterParam, type H3Event } from 'h3'
import { fetchBackendData } from '../../../../utils/backend-api'
import { definePageBffHandler } from '../../../../utils/page-bff'

async function handler(event: H3Event) {
  const id = Number(getRouterParam(event, 'id'))

  const [
    light_novel,
    volumes,
    people,
    producers,
    my_rate,
    favorite,
    progress,
    my_cover_vote,
    rates,
    statistics,
    keywords,
  ] = await Promise.all([
    fetchBackendData(event, '/api/v3/light-novels/{id}', { path: { id } }),
    fetchBackendData(event, '/api/v3/light-novels/{id}/volumes', { path: { id } }),
    fetchBackendData(event, '/api/v3/light-novels/{id}/people', { path: { id } }),
    fetchBackendData(event, '/api/v3/light-novels/{id}/producers', { path: { id } }),
    fetchBackendData(event, '/api/v3/light-novels/{id}/rate', { path: { id } }).catch(() => null),
    fetchBackendData(event, '/api/v3/user/me/favorite/lightnovels/{light_novel_id}', {
      path: { light_novel_id: id },
    }).catch(() => null),
    fetchBackendData(event, '/api/v3/reader/light-novels/{light_novel_id}/progress', {
      path: { light_novel_id: id },
    }).catch(() => null),
    fetchBackendData(event, '/api/v3/light-novels/{id}/covers/vote', { path: { id } }).catch(
      () => null,
    ),
    fetchBackendData(event, '/api/v3/light-novels/{id}/rates', {
      path: { id },
      query: { page: 1, page_size: 20, sort: 'hot' },
    }),
    fetchBackendData(event, '/api/v3/light-novels/{id}/rates/statistics', { path: { id } }),
    fetchBackendData(event, '/api/v3/light-novels/{id}/rates/keywords', { path: { id } }),
  ])

  return {
    light_novel,
    volumes,
    people,
    producers,
    my_rate,
    favorite,
    progress,
    my_cover_vote,
    rates,
    statistics,
    keywords,
  }
}

export type LightNovelRatesPageData = Awaited<ReturnType<typeof handler>>
export default definePageBffHandler(handler, {
  mergedRedirect: id => `/light-novels/${id}/rates`,
})
