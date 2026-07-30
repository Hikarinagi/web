import { getQuery, type H3Event } from 'h3'
import { fetchBackendData } from '../../../../utils/backend-api'
import { definePageBffHandler } from '../../../../utils/page-bff'

async function handler(event: H3Event) {
  const rawQuery = getQuery(event)
  const groups = await fetchBackendData(event, '/api/v3/permission-groups', {
    query: {
      page: Number(rawQuery.page) || 1,
      page_size: Number(rawQuery.page_size) || 20,
    },
  })
  return { groups }
}

export type CreatorGovernanceGroupsPageData = Awaited<ReturnType<typeof handler>>
export default definePageBffHandler(handler)
