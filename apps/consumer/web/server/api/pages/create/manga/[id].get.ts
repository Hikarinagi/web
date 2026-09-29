import { createError, getRouterParam, type H3Event } from 'h3'
import { fetchBackendData } from '~~/server/utils/backend-api'
import { definePageBffHandler } from '~~/server/utils/page-bff'

async function handler(event: H3Event) {
  const id = Number(getRouterParam(event, 'id'))
  if (!Number.isInteger(id) || id < 1) {
    throw createError({ statusCode: 400, statusMessage: 'Bad Request' })
  }
  const path = { project_id: id }
  const project = await fetchBackendData(event, '/api/v3/manga-projects/{project_id}', { path })
  const [pages, regions, tasks, review] = await Promise.all([
    fetchBackendData(event, '/api/v3/manga-projects/{project_id}/pages', { path }),
    project.mode === 'TRANSLATION'
      ? fetchBackendData(event, '/api/v3/manga-projects/{project_id}/regions', { path })
      : Promise.resolve([]),
    fetchBackendData(event, '/api/v3/manga-projects/{project_id}/tasks', { path }),
    fetchBackendData(event, '/api/v3/manga-projects/{project_id}/review', { path }).catch(
      () => null,
    ),
  ])
  return { project, pages, regions, tasks, review }
}

export type WorkbenchMangaProjectPageData = Awaited<ReturnType<typeof handler>>
export default definePageBffHandler(handler)
