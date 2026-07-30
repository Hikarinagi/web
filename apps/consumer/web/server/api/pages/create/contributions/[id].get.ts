import { getRouterParam, type H3Event } from 'h3'
import { fetchBackendData } from '../../../../utils/backend-api'
import { definePageBffHandler } from '../../../../utils/page-bff'

async function handler(event: H3Event) {
  const id = Number(getRouterParam(event, 'id'))
  const change_request = await fetchBackendData(event, '/api/v3/change-requests/{id}', {
    path: { id },
  })

  const batch = change_request.batch_id
    ? await fetchBackendData(event, '/api/v3/change-requests', {
        query: { batch_id: change_request.batch_id, page: 1, page_size: 50 },
      })
    : null
  const batch_members = batch?.items.filter(item => item.id !== change_request.id) ?? []

  return { change_request, batch_members }
}

export type CreatorContributionPageData = Awaited<ReturnType<typeof handler>>
export default definePageBffHandler(handler)
