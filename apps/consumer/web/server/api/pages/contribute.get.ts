import { getQuery, type H3Event } from 'h3'
import { fetchBackendData } from '~~/server/utils/backend-api'
import { definePageBffHandler } from '~~/server/utils/page-bff'

function positive(value: unknown): number | null {
  const number = Number(value)
  return Number.isInteger(number) && number > 0 ? number : null
}

async function handler(event: H3Event) {
  const query = getQuery(event)
  const volumeId = positive(query.volume)
  const mangaId = positive(query.manga)
  const page = { page: 1, page_size: 100 }
  const [volumes, chapters, mangaVolumes, novelContributors, mangaContributors, matches, manga] =
    await Promise.all([
      fetchBackendData(event, '/api/v3/light-novel-volumes/wanted', { query: page }),
      fetchBackendData(event, '/api/v3/manga-chapters/wanted', { query: page }),
      fetchBackendData(event, '/api/v3/manga-volumes/wanted', { query: page }),
      fetchBackendData(event, '/api/v3/light-novel-volumes/contributors'),
      fetchBackendData(event, '/api/v3/manga-chapters/contributors'),
      volumeId
        ? fetchBackendData(event, '/api/v3/light-novel-volumes', {
            query: { search: String(volumeId), page: 1, page_size: 50 },
          }).catch(() => null)
        : null,
      mangaId
        ? fetchBackendData(event, '/api/v3/mangas/{id}', { path: { id: mangaId } }).catch(
            () => null,
          )
        : null,
    ])
  return {
    volumes: volumes.items,
    chapters: chapters.items,
    manga_volumes: mangaVolumes.items,
    contributors: { novel: novelContributors, manga: mangaContributors },
    target: matches?.items.find(item => item.id === volumeId) ?? null,
    manga: manga ? { id: manga.id, title: manga.name_cn || manga.name } : null,
  }
}

export type ContributePageData = Awaited<ReturnType<typeof handler>>
export default definePageBffHandler(handler)
