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
  const [pages, review, check, baseline] = await Promise.all([
    fetchBackendData(event, '/api/v3/manga-projects/{project_id}/pages', { path }),
    fetchBackendData(event, '/api/v3/manga-projects/{project_id}/review', { path }).catch(
      () => null,
    ),
    fetchBackendData(event, '/api/v3/manga-projects/{project_id}/check', { path }).catch(
      () => null,
    ),
    project.replaces
      ? fetchBackendData(event, '/api/v3/manga-projects/{project_id}/baseline-pages', { path })
      : Promise.resolve([]),
  ])
  return { project, pages, review, check, baseline }
}

export type MangaReviewPageData = Awaited<ReturnType<typeof handler>>
export default definePageBffHandler(handler)
