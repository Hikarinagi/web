import { createError, getQuery, getRouterParam, type H3Event } from 'h3'
import { CHANGE_PARTS_PAGE_SIZE } from '~/features/wiki/changes'
import { readPage } from '~/features/wiki/history'
import { fetchBackendData } from '~~/server/utils/backend-api'
import { definePageBffHandler } from '~~/server/utils/page-bff'
import { wikiNames } from '~~/server/utils/wiki-names'

async function handler(event: H3Event) {
  const id = Number(getRouterParam(event, 'id'))
  if (!Number.isInteger(id) || id < 1) {
    throw createError({ statusCode: 400, statusMessage: 'Bad Request' })
  }
  const page = readPage(getQuery(event).entry_page)
  const [{ operations: _operations, ...edit }, definitions] = await Promise.all([
    fetchBackendData(event, '/api/v3/wiki/edits/{id}', {
      path: { id },
      query: { page, page_size: CHANGE_PARTS_PAGE_SIZE },
    }),
    fetchBackendData(event, '/api/v3/wiki/definitions'),
  ])
  return {
    edit,
    page,
    names: wikiNames(
      definitions,
      edit.entries.map(item => item.entry.type),
    ),
  }
}

export type ChangePageData = Awaited<ReturnType<typeof handler>>
export default definePageBffHandler(handler)
