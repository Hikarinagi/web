import type { H3Event } from 'h3'
import { fetchBackendData } from '../../../utils/backend-api'
import { definePageBffHandler } from '../../../utils/page-bff'

async function handler(event: H3Event) {
  const [tasks, cards, limits] = await Promise.all([
    fetchBackendData(event, '/api/v3/user/me/downloads', { query: { page: 1, page_size: 100 } }),
    fetchBackendData(event, '/api/v3/user/me/download/cards'),
    fetchBackendData(event, '/api/v3/user/me/downloads/limits'),
  ])

  return { tasks: tasks.items, cards, limits }
}

export type DownloadsPageData = Awaited<ReturnType<typeof handler>>
export default definePageBffHandler(handler)
