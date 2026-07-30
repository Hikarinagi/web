import { getRouterParam, type H3Event } from 'h3'
import { fetchBackendData } from '../../../../utils/backend-api'
import { definePageBffHandler } from '../../../../utils/page-bff'

async function handler(event: H3Event) {
  const id = Number(getRouterParam(event, 'id'))

  const [galgame, producers, my_rate, favorite, my_cover_vote, resources, banners] =
    await Promise.all([
      fetchBackendData(event, '/api/v3/galgames/{id}', { path: { id } }),
      fetchBackendData(event, '/api/v3/galgames/{id}/producers', { path: { id } }),
      fetchBackendData(event, '/api/v3/galgames/{id}/rate', { path: { id } }).catch(() => null),
      fetchBackendData(event, '/api/v3/user/me/favorite/galgames/{galgame_id}', {
        path: { galgame_id: id },
      }).catch(() => null),
      fetchBackendData(event, '/api/v3/galgames/{id}/covers/vote', { path: { id } }).catch(
        () => null,
      ),
      fetchBackendData(event, '/api/v3/galgames/{id}/downloads', { path: { id } }).catch(() => []),
      fetchBackendData(event, '/api/v3/promotions/banners', {
        query: { surface: 'GALGAME_DOWNLOAD' },
      }).catch(() => []),
    ])

  return { galgame, producers, my_rate, favorite, my_cover_vote, resources, banners }
}

export type GalgameDownloadsPageData = Awaited<ReturnType<typeof handler>>
export default definePageBffHandler(handler, {
  mergedRedirect: id => `/galgames/${id}/downloads`,
})
