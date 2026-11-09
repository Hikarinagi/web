import { getRouterParam, type H3Event } from 'h3'
import { fetchBackendData } from '../../../../../utils/backend-api'
import { definePageBffHandler } from '../../../../../utils/page-bff'

async function handler(event: H3Event) {
  const id = Number(getRouterParam(event, 'id'))
  const revision = Number(getRouterParam(event, 'revision'))

  const snapshot = await fetchBackendData(event, '/api/v3/galgames/{id}/history/{revision}', {
    path: { id, revision },
  })

  return { snapshot }
}

export type GalgameSnapshotPageData = Awaited<ReturnType<typeof handler>>
export default definePageBffHandler(handler, {
  mergedRedirect: id => `/galgames/${id}/revisions`,
})
