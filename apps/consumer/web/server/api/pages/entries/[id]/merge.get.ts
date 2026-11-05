import { createError, getRouterParam, type H3Event } from 'h3'
import { fetchBackendData } from '~~/server/utils/backend-api'
import { definePageBffHandler } from '~~/server/utils/page-bff'

async function handler(event: H3Event) {
  const id = Number(getRouterParam(event, 'id'))
  if (!Number.isInteger(id) || id < 1) {
    throw createError({ statusCode: 400, statusMessage: 'Bad Request' })
  }
  const entry = await fetchBackendData(event, '/api/v3/wiki/entries/{id}', { path: { id } })
  return { entry: { id: entry.id, type: entry.type, label: entry.label } }
}

export type MergePickPageData = Awaited<ReturnType<typeof handler>>
export default definePageBffHandler(handler)
