import { createError, getRouterParam, type H3Event } from 'h3'
import { MATCHING_CODES } from '~/features/wiki/codes'
import type { EditableEntry } from '~/features/wiki/editor/draft'
import { fetchBackendData } from '~~/server/utils/backend-api'
import { definePageBffHandler } from '~~/server/utils/page-bff'

async function handler(event: H3Event) {
  const id = Number(getRouterParam(event, 'id'))
  const other = Number(getRouterParam(event, 'other'))
  if (!Number.isInteger(id) || id < 1 || !Number.isInteger(other) || other < 1 || id === other) {
    throw createError({ statusCode: 400, statusMessage: 'Bad Request' })
  }
  const [kept, merged, definitions, preview] = await Promise.all([
    fetchBackendData(event, '/api/v3/wiki/entries/{id}', { path: { id } }),
    fetchBackendData(event, '/api/v3/wiki/entries/{id}', { path: { id: other } }),
    fetchBackendData(event, '/api/v3/wiki/definitions'),
    fetchBackendData(event, '/api/v3/wiki/entries/{id}/merge-preview', {
      path: { id: other },
      query: { into: id },
    }),
  ])
  const visible = (entry: EditableEntry): EditableEntry => ({
    ...entry,
    statements: entry.statements.filter(
      item =>
        item.status !== 'DEPRECATED' &&
        (item.property !== 'IDENTIFIER' || !MATCHING_CODES.includes(item.code ?? '')),
    ),
  })
  return {
    kept: visible(kept),
    merged: visible(merged),
    preview,
    definition: definitions.find(item => item.type === kept.type) ?? null,
  }
}

export type MergePageData = Awaited<ReturnType<typeof handler>>
export default definePageBffHandler(handler)
