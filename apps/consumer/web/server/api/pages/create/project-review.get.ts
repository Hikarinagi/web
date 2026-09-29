import type { H3Event } from 'h3'
import { fetchBackendData } from '~~/server/utils/backend-api'
import { definePageBffHandler } from '~~/server/utils/page-bff'
import { readPage } from '~~/server/utils/page-query'

async function handler(event: H3Event) {
  const projects = await fetchBackendData(event, '/api/v3/novel-projects', {
    query: { page: readPage(event), page_size: 20, status: ['REVIEW'] },
  })
  return { projects }
}

export type WorkbenchReviewPageData = Awaited<ReturnType<typeof handler>>
export default definePageBffHandler(handler)
