import { createError, getRouterParam, type H3Event } from 'h3'
import { fetchBackendData } from '~~/server/utils/backend-api'
import { definePageBffHandler } from '~~/server/utils/page-bff'

function text(value: unknown) {
  return typeof value === 'string' ? value : null
}

async function handler(event: H3Event) {
  const id = Number(getRouterParam(event, 'id'))
  if (!Number.isInteger(id) || id < 1) {
    throw createError({ statusCode: 400, statusMessage: 'Bad Request' })
  }
  const path = { project_id: id }
  const project = await fetchBackendData(event, '/api/v3/manga-projects/{project_id}', { path })
  const chapterId = project.status === 'PUBLISHED' ? (project.chapter?.id ?? null) : null
  const [pages, regions, tasks, review, snapshot, pending] = await Promise.all([
    fetchBackendData(event, '/api/v3/manga-projects/{project_id}/pages', { path }),
    project.mode === 'TRANSLATION'
      ? fetchBackendData(event, '/api/v3/manga-projects/{project_id}/regions', { path })
      : Promise.resolve([]),
    fetchBackendData(event, '/api/v3/manga-projects/{project_id}/tasks', { path }),
    fetchBackendData(event, '/api/v3/manga-projects/{project_id}/review', { path }).catch(
      () => null,
    ),
    chapterId
      ? fetchBackendData(event, '/api/v3/contribution/snapshots/{resource_type}/{id}', {
          path: { resource_type: 'manga-chapter', id: chapterId },
        }).catch(() => null)
      : null,
    chapterId
      ? fetchBackendData(event, '/api/v3/change-requests', {
          query: {
            resource_type: 'MANGA_CHAPTER',
            resource_id: chapterId,
            status: 'PENDING',
            page: 1,
            page_size: 1,
          },
        }).catch(() => null)
      : null,
  ])
  const chapter =
    chapterId && snapshot
      ? {
          id: chapterId,
          chapter_number: text(snapshot.snapshot.chapter_number),
          name: text(snapshot.snapshot.name),
          volume_id:
            typeof snapshot.snapshot.volume_id === 'number' ? snapshot.snapshot.volume_id : null,
        }
      : null
  return {
    project,
    pages,
    regions,
    tasks,
    review,
    chapter,
    pending_change: pending?.items[0] ?? null,
  }
}

export type WorkbenchMangaProjectPageData = Awaited<ReturnType<typeof handler>>
export default definePageBffHandler(handler)
