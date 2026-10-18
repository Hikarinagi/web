import { getRouterParam, type H3Event } from 'h3'
import { fetchBackendData } from '../../../../../utils/backend-api'
import { definePageBffHandler } from '../../../../../utils/page-bff'

async function handler(event: H3Event) {
  const id = Number(getRouterParam(event, 'id'))
  const chapterId = Number(getRouterParam(event, 'chapterId'))
  const [manifest, chapters, my_rate] = await Promise.all([
    fetchBackendData(event, '/api/v3/reader/mangas/{manga_id}/chapters/{chapter_id}', {
      path: { manga_id: id, chapter_id: chapterId },
    }),
    fetchBackendData(event, '/api/v3/mangas/{id}/chapters', { path: { id } }),
    fetchBackendData(event, '/api/v3/mangas/{id}/rate', { path: { id } }).catch(() => null),
  ])
  return { manifest, chapters, my_rate }
}

export type MangaReadPageData = Awaited<ReturnType<typeof handler>>
export default definePageBffHandler(handler)
