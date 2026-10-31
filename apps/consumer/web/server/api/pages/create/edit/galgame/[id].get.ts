import { createError, getRouterParam, type H3Event } from 'h3'
import { topVotedMedia } from '~/utils/media/image'
import { fetchBackendData } from '../../../../../utils/backend-api'
import { definePageBffHandler } from '../../../../../utils/page-bff'

async function handler(event: H3Event) {
  const id = Number(getRouterParam(event, 'id'))
  const galgame = await fetchBackendData(event, '/api/v3/galgames/{id}', { path: { id } })
  if (!galgame.entry_id) throw createError({ statusCode: 404, statusMessage: 'Entry not found' })

  const [display, entry, definitions, products, todos, references, facts, credits] =
    await Promise.all([
      fetchBackendData(event, '/api/v3/galgames/{id}/display', { path: { id } }),
      fetchBackendData(event, '/api/v3/wiki/entries/{id}', { path: { id: galgame.entry_id } }),
      fetchBackendData(event, '/api/v3/wiki/definitions'),
      fetchBackendData(event, '/api/v3/galgames/{id}/products', { path: { id } }),
      fetchBackendData(event, '/api/v3/wiki/todos', {
        query: { entry_id: galgame.entry_id, page: 1, page_size: 20 },
      }),
      fetchBackendData(event, '/api/v3/wiki/entries/{id}/references', {
        path: { id: galgame.entry_id },
      }),
      fetchBackendData(event, '/api/v3/galgames/{id}/facts', { path: { id } }),
      fetchBackendData(event, '/api/v3/galgames/{id}/credits', { path: { id } }),
    ])
  const first = credits.product
    ? await fetchBackendData(event, '/api/v3/wiki/entries/{id}', {
        path: { id: credits.product.id },
      })
    : null

  return {
    galgame: { id, entry_id: galgame.entry_id, cover: topVotedMedia(galgame.covers) },
    display,
    entry,
    definitions,
    products,
    todos,
    facts,
    credits: {
      product: credits.product,
      statements:
        first?.statements.filter(
          item => item.property === 'CREDIT' && item.status !== 'DEPRECATED',
        ) ?? [],
    },
    appearances: references.filter(group => group.type === 'APPEARANCE'),
    links:
      references.find(group => group.type === 'PRODUCT' && group.property === 'INCLUDED_GAME') ??
      null,
  }
}

export type GalgameEditPageData = Awaited<ReturnType<typeof handler>>
export default definePageBffHandler(handler, {
  mergedRedirect: id => `/create/edit/galgame/${id}`,
})
