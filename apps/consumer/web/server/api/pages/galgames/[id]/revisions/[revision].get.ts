import { getRouterParam, type H3Event } from 'h3'
import { fetchBackendData } from '../../../../../utils/backend-api'
import { definePageBffHandler } from '../../../../../utils/page-bff'
import * as page from '../../[id].get'

async function handler(event: H3Event) {
  const id = Number(getRouterParam(event, 'id'))
  const revision = Number(getRouterParam(event, 'revision'))

  const [current, snapshot] = await Promise.all([
    page.handler(event),
    fetchBackendData(event, '/api/v3/galgames/{id}/history/{revision}', {
      path: { id, revision },
    }),
  ])

  return { ...current, ...snapshot }
}

export type GalgameSnapshotPageData = Awaited<ReturnType<typeof handler>>
export default definePageBffHandler(handler, {
  mergedRedirect: id => `/galgames/${id}/revisions`,
})
