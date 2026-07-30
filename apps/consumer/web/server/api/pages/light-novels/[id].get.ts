import { getRouterParam, type H3Event } from 'h3'
import { fetchBackendData } from '../../../utils/backend-api'
import { definePageBffHandler } from '../../../utils/page-bff'

async function handler(event: H3Event) {
  const id = Number(getRouterParam(event, 'id'))

  const [
    light_novel,
    volumes,
    tags,
    people,
    producers,
    characters,
    relations,
    rate_stats,
    top_rates,
    articles,
    posts,
    contributors,
    my_rate,
    favorite,
    progress,
    my_cover_vote,
  ] = await Promise.all([
    fetchBackendData(event, '/api/v3/light-novels/{id}', { path: { id } }),
    fetchBackendData(event, '/api/v3/light-novels/{id}/volumes', { path: { id } }),
    fetchBackendData(event, '/api/v3/light-novels/{id}/tags', { path: { id } }),
    fetchBackendData(event, '/api/v3/light-novels/{id}/people', { path: { id } }),
    fetchBackendData(event, '/api/v3/light-novels/{id}/producers', { path: { id } }),
    fetchBackendData(event, '/api/v3/light-novels/{id}/characters', { path: { id } }),
    fetchBackendData(event, '/api/v3/light-novels/{id}/relations', { path: { id } }),
    fetchBackendData(event, '/api/v3/light-novels/{id}/rates/statistics', { path: { id } }),
    fetchBackendData(event, '/api/v3/light-novels/{id}/rates', {
      path: { id },
      query: { page: 1, page_size: 12, sort: 'hot' },
    }),
    fetchBackendData(event, '/api/v3/light-novels/{id}/articles', {
      path: { id },
      query: { page: 1, page_size: 6 },
    }),
    fetchBackendData(event, '/api/v3/light-novels/{id}/posts', {
      path: { id },
      query: { page: 1, page_size: 8 },
    }),
    fetchBackendData(event, '/api/v3/light-novels/{id}/contributors', { path: { id } }),
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
  ])

  return {
    light_novel,
    volumes,
    tags,
    people,
    producers,
    characters,
    relations,
    rate_stats,
    top_rates,
    articles,
    posts,
    contributors,
    my_rate,
    favorite,
    progress,
    my_cover_vote,
  }
}

export type LightNovelPageData = Awaited<ReturnType<typeof handler>>
export default definePageBffHandler(handler, {
  mergedRedirect: id => `/light-novels/${id}`,
})
