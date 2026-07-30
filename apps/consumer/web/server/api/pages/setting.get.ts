import type { H3Event } from 'h3'
import { fetchBackendData } from '../../utils/backend-api'
import { definePageBffHandler } from '../../utils/page-bff'

async function handler(event: H3Event) {
  const me = await fetchBackendData(event, '/api/v3/user/me')
  return { me }
}

export type SpaceSettingPageData = Awaited<ReturnType<typeof handler>>
export default definePageBffHandler(handler)
