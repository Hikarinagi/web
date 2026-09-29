import { createError, getQuery, getRouterParam, type H3Event } from 'h3'
import { fetchBackendData } from '~~/server/utils/backend-api'
import { definePageBffHandler } from '~~/server/utils/page-bff'

async function handler(event: H3Event) {
  const id = Number(getRouterParam(event, 'id'))
  if (!Number.isInteger(id) || id < 1) {
    throw createError({ statusCode: 400, statusMessage: 'Bad Request' })
  }
  const path = { project_id: id }
  const project = await fetchBackendData(event, '/api/v3/novel-projects/{project_id}', { path })
  const translation = project.mode === 'TRANSLATION'
  const [chapters, review, terms, quota, volume] = await Promise.all([
    fetchBackendData(event, '/api/v3/novel-projects/{project_id}/chapters', { path }),
    fetchBackendData(event, '/api/v3/novel-projects/{project_id}/review', { path }).catch(
      () => null,
    ),
    translation
      ? fetchBackendData(event, '/api/v3/light-novels/{light_novel_id}/terms', {
          path: { light_novel_id: project.volume.series.id },
        })
      : Promise.resolve([]),
    translation && project.viewer_role
      ? fetchBackendData(event, '/api/v3/user/me/ai-quota')
      : Promise.resolve(null),
    fetchBackendData(event, '/api/v3/light-novel-volumes/{id}', {
      path: { id: project.volume.id },
    }).catch(() => null),
  ])
  const requested = Number(getQuery(event).chapter)
  const chapter =
    chapters.find(item => item.id === requested) ??
    (translation ? chapters.find(item => item.done_count < item.segment_count) : undefined) ??
    chapters[0] ??
    null
  const [segments, pretranslations] = chapter
    ? await Promise.all([
        fetchBackendData(event, '/api/v3/novel-chapters/{chapter_id}/segments', {
          path: { chapter_id: chapter.id },
        }),
        translation
          ? fetchBackendData(event, '/api/v3/novel-chapters/{chapter_id}/pretranslations', {
              path: { chapter_id: chapter.id },
            })
          : Promise.resolve([]),
      ])
    : [[], []]
  return {
    project,
    chapters,
    chapter,
    segments,
    terms,
    pretranslations,
    quota,
    review,
    has_epub: volume?.online_reading_available ?? false,
  }
}

export type WorkbenchProjectPageData = Awaited<ReturnType<typeof handler>>
export default definePageBffHandler(handler)
