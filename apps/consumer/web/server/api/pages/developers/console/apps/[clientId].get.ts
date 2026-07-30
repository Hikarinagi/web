import type { H3Event } from 'h3'
import { getRouterParam } from 'h3'
import { fetchBackendData } from '../../../../../utils/backend-api'
import { definePageBffHandler } from '../../../../../utils/page-bff'

async function handler(event: H3Event) {
  const clientId = getRouterParam(event, 'clientId') ?? ''
  const app = await fetchBackendData(event, '/api/v3/user/me/developer/apps/{client_id}', {
    path: { client_id: clientId },
  })
  return { app }
}

export type DeveloperAppPageData = Awaited<ReturnType<typeof handler>>

export default definePageBffHandler(handler)
