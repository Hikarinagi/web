import { createError, getRouterParam, type H3Event } from 'h3'
import { fetchBackendData } from '../../../../../utils/backend-api'
import { definePageBffHandler } from '../../../../../utils/page-bff'

async function handler(event: H3Event) {
  const id = Number(getRouterParam(event, 'id'))
  if (!Number.isInteger(id) || id < 1) {
    throw createError({ statusCode: 400, statusMessage: 'Bad Request' })
  }
  const [group, members, catalog] = await Promise.all([
    fetchBackendData(event, '/api/v3/permission-groups/{id}', { path: { id } }),
    fetchBackendData(event, '/api/v3/permission-groups/{id}/members', {
      path: { id },
      query: { page: 1, page_size: 50 },
    }),
    fetchBackendData(event, '/api/v3/permissions/catalog'),
  ])
  return { group, members, catalog }
}

export type CreatorGovernanceGroupPageData = Awaited<ReturnType<typeof handler>>
export default definePageBffHandler(handler)
