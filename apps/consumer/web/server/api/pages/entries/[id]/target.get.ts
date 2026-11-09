import { createError, getRouterParam, type H3Event } from 'h3'
import { fetchBackendData } from '~~/server/utils/backend-api'
import { definePageBffHandler } from '~~/server/utils/page-bff'
import { editorTarget } from '~~/server/utils/wiki-editor'

async function handler(event: H3Event) {
  const id = Number(getRouterParam(event, 'id'))
  if (!Number.isInteger(id) || id < 1) {
    throw createError({ statusCode: 400, statusMessage: 'Bad Request' })
  }
  const entry = await fetchBackendData(event, '/api/v3/wiki/entries/{id}', { path: { id } })
  return { target: await editorTarget(event, entry) }
}

export type EditorTargetPageData = Awaited<ReturnType<typeof handler>>
export default definePageBffHandler(handler)
