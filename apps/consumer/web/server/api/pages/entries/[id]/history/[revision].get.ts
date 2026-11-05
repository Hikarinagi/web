import { createError, getRouterParam, type H3Event } from 'h3'
import { fetchBackendData } from '~~/server/utils/backend-api'
import { definePageBffHandler } from '~~/server/utils/page-bff'
import { wikiNames } from '~~/server/utils/wiki-names'

async function handler(event: H3Event) {
  const id = Number(getRouterParam(event, 'id'))
  const number = Number(getRouterParam(event, 'revision'))
  if (!Number.isInteger(id) || id < 1 || !Number.isInteger(number) || number < 1) {
    throw createError({ statusCode: 400, statusMessage: 'Bad Request' })
  }
  const [version, entry, definitions] = await Promise.all([
    fetchBackendData(event, '/api/v3/wiki/entries/{id}/revisions/{number}', {
      path: { id, number },
    }),
    fetchBackendData(event, '/api/v3/wiki/entries/{id}', { path: { id } }),
    fetchBackendData(event, '/api/v3/wiki/definitions'),
  ])
  const edit = await fetchBackendData(event, '/api/v3/wiki/edits/{id}', {
    path: { id: version.edit_id },
  })
  return {
    version,
    entry,
    edit,
    names: wikiNames(definitions, [entry.type, ...edit.entries.map(item => item.entry.type)]),
  }
}

export type VersionPageData = Awaited<ReturnType<typeof handler>>
export default definePageBffHandler(handler)
