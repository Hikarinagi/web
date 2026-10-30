import { createError, getRouterParam, type H3Event } from 'h3'
import { fetchBackendData } from '../../../../../utils/backend-api'
import { definePageBffHandler } from '../../../../../utils/page-bff'

async function handler(event: H3Event) {
  const id = Number(getRouterParam(event, 'id'))
  const galgame = await fetchBackendData(event, '/api/v3/galgames/{id}', { path: { id } })
  if (!galgame.entry_id) throw createError({ statusCode: 404, statusMessage: 'Entry not found' })

  const [display, entry, definitions, products, todos, history, references] = await Promise.all([
    fetchBackendData(event, '/api/v3/galgames/{id}/display', { path: { id } }),
    fetchBackendData(event, '/api/v3/wiki/entries/{id}', { path: { id: galgame.entry_id } }),
    fetchBackendData(event, '/api/v3/wiki/definitions'),
    fetchBackendData(event, '/api/v3/galgames/{id}/products', { path: { id } }),
    fetchBackendData(event, '/api/v3/wiki/todos', {
      query: { entry_id: galgame.entry_id, page: 1, page_size: 20 },
    }),
    fetchBackendData(event, '/api/v3/galgames/{id}/history', {
      path: { id },
      query: { page: 1, page_size: 3 },
    }),
    fetchBackendData(event, '/api/v3/wiki/entries/{id}/references', {
      path: { id: galgame.entry_id },
    }),
  ])

  return {
    galgame: { id, entry_id: galgame.entry_id },
    display,
    entry,
    definitions,
    products,
    todos,
    history,
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
