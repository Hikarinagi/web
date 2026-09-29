import { getQuery, type H3Event } from 'h3'
import { fetchBackendData } from '~~/server/utils/backend-api'
import { definePageBffHandler } from '~~/server/utils/page-bff'
import { readPage } from '~~/server/utils/page-query'

async function handler(event: H3Event) {
  const kind = getQuery(event).kind
  const page = readPage(event)
  const query = { mine: true, page, page_size: 20 }
  const [projects, mangaProjects, epubs] = await Promise.all([
    kind === 'novel' || !kind ? fetchBackendData(event, '/api/v3/novel-projects', { query }) : null,
    kind === 'manga' ? fetchBackendData(event, '/api/v3/manga-projects', { query }) : null,
    kind === 'epub'
      ? fetchBackendData(event, '/api/v3/user/me/epub/corrections', {
          query: { page, page_size: 20 },
        })
      : null,
  ])
  return { projects, mangaProjects, epubs }
}

export type WorkbenchHomePageData = Awaited<ReturnType<typeof handler>>
export default definePageBffHandler(handler)
