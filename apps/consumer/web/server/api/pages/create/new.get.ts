import type { H3Event } from 'h3'
import { fetchBackendData } from '../../../utils/backend-api'
import { definePageBffHandler } from '../../../utils/page-bff'

async function handler(event: H3Event) {
  return { definitions: await fetchBackendData(event, '/api/v3/wiki/definitions') }
}

export type CreatorNewPageData = Awaited<ReturnType<typeof handler>>
export default definePageBffHandler(handler)
