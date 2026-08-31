import type { H3Event } from 'h3'
import { fetchBackendData } from '../../../utils/backend-api'
import { definePageBffHandler } from '../../../utils/page-bff'

async function handler(event: H3Event) {
  const manga = await fetchBackendData(event, '/api/v3/reader/me/manga/notification')
  return { manga }
}

export type NotificationPageData = Awaited<ReturnType<typeof handler>>
export default definePageBffHandler(handler)
