import { getRouterParam, type H3Event } from 'h3'
import { fetchBackendData } from '../../../utils/backend-api'
import { definePageBffHandler } from '../../../utils/page-bff'

async function handler(event: H3Event) {
  const id = Number(getRouterParam(event, 'id'))

  const [
    galgame,
    tags,
    producers,
    staff,
    characters,
    relations,
    contributors,
    rate_stats,
    top_rates,
    articles,
    posts,
    my_rate,
    favorite,
    my_cover_vote,
  ] = await Promise.all([
    fetchBackendData(event, '/api/v3/galgames/{id}', { path: { id } }),
    fetchBackendData(event, '/api/v3/galgames/{id}/tags', { path: { id } }),
    fetchBackendData(event, '/api/v3/galgames/{id}/producers', { path: { id } }),
    fetchBackendData(event, '/api/v3/galgames/{id}/staff', { path: { id } }),
    fetchBackendData(event, '/api/v3/galgames/{id}/characters', { path: { id } }),
    fetchBackendData(event, '/api/v3/galgames/{id}/relations', { path: { id } }),
    fetchBackendData(event, '/api/v3/galgames/{id}/contributors', { path: { id } }),
    fetchBackendData(event, '/api/v3/galgames/{id}/rates/statistics', { path: { id } }),
    fetchBackendData(event, '/api/v3/galgames/{id}/rates', {
      path: { id },
      query: { page: 1, page_size: 12, sort: 'hot', has_content: true },
    }),
    fetchBackendData(event, '/api/v3/galgames/{id}/articles', {
      path: { id },
      query: { page: 1, page_size: 6 },
    }),
    fetchBackendData(event, '/api/v3/galgames/{id}/posts', {
      path: { id },
      query: { page: 1, page_size: 8 },
    }),
    fetchBackendData(event, '/api/v3/galgames/{id}/rate', { path: { id } }).catch(() => null),
    fetchBackendData(event, '/api/v3/user/me/favorite/galgames/{galgame_id}', {
      path: { galgame_id: id },
    }).catch(() => null),
    fetchBackendData(event, '/api/v3/galgames/{id}/covers/vote', { path: { id } }).catch(
      () => null,
    ),
  ])

  return {
    galgame,
    tags,
    producers,
    staff,
    characters,
    relations,
    contributors,
    rate_stats,
    top_rates,
    articles,
    posts,
    my_rate,
    favorite,
    my_cover_vote,
  }
}

export type GalgamePageData = Awaited<ReturnType<typeof handler>>
export default definePageBffHandler(handler, {
  mergedRedirect: id => `/galgames/${id}`,
})
