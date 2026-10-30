import { createError, getQuery, getRouterParam, type H3Event } from 'h3'
import { fetchBackendData } from '../../../../../../utils/backend-api'
import { definePageBffHandler } from '../../../../../../utils/page-bff'

async function handler(event: H3Event) {
  const id = Number(getRouterParam(event, 'id'))
  const page = Number(getQuery(event).page) || 1
  const galgame = await fetchBackendData(event, '/api/v3/galgames/{id}', { path: { id } })
  if (!galgame.entry_id) throw createError({ statusCode: 404, statusMessage: 'Entry not found' })

  const [display, history] = await Promise.all([
    fetchBackendData(event, '/api/v3/galgames/{id}/display', { path: { id } }),
    fetchBackendData(event, '/api/v3/galgames/{id}/history', {
      path: { id },
      query: { page, page_size: 20 },
    }),
  ])

  return {
    galgame: { id, entry_id: galgame.entry_id },
    display,
    history: {
      ...history,
      items: history.items.map((row, index) => ({
        ...row,
        id: row.revision ?? -(history.meta.page * history.meta.page_size + index),
      })),
    },
  }
}

export type GalgameEditHistoryPageData = Awaited<ReturnType<typeof handler>>
export default definePageBffHandler(handler, {
  mergedRedirect: id => `/create/edit/galgame/${id}/history`,
})
