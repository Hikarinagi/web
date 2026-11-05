import { createError, getRouterParam, type H3Event } from 'h3'
import { fetchBackendData } from '~~/server/utils/backend-api'
import { definePageBffHandler } from '~~/server/utils/page-bff'
import { wikiNames } from '~~/server/utils/wiki-names'

async function handler(event: H3Event) {
  const id = Number(getRouterParam(event, 'id'))
  if (!Number.isInteger(id) || id < 1) {
    throw createError({ statusCode: 400, statusMessage: 'Bad Request' })
  }
  const [edit, definitions] = await Promise.all([
    fetchBackendData(event, '/api/v3/wiki/edits/{id}', { path: { id } }),
    fetchBackendData(event, '/api/v3/wiki/definitions'),
  ])
  return {
    edit,
    names: wikiNames(
      definitions,
      edit.entries.map(item => item.entry.type),
    ),
  }
}

export type ChangePageData = Awaited<ReturnType<typeof handler>>
export default definePageBffHandler(handler)
