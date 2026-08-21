import { getRouterParam, type H3Event } from 'h3'
import { fetchTab, readTab } from '~/features/space/server/page-bff'
import { fetchBackendData } from '../../../../utils/backend-api'
import { definePageBffHandler } from '../../../../utils/page-bff'

async function handler(event: H3Event) {
  const id = Number(getRouterParam(event, 'id'))
  const me = await fetchBackendData(event, '/api/v3/user/me').catch(() => null)
  const is_self = me?.id === id

  return {
    is_self,
    ...(await fetchTab(event, id, readTab(event), is_self)),
  }
}

export type SpaceTabPageData = Awaited<ReturnType<typeof handler>>
export default definePageBffHandler(handler)
