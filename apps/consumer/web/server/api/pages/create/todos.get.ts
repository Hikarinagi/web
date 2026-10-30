import type { components } from '@hikarinagi/api-contract/v3'
import { getQuery, type H3Event } from 'h3'
import { sectionQuery } from '~/features/creator/sections'
import { fetchBackendData } from '../../../utils/backend-api'
import { definePageBffHandler } from '../../../utils/page-bff'

type TodoKind = components['schemas']['TodoDto']['kind']

async function handler(event: H3Event) {
  const query = getQuery(event)
  const page = Number(query.page) || 1
  const definitions = await fetchBackendData(event, '/api/v3/wiki/definitions')
  const kind = typeof query.kind === 'string' && /^[A-Z_]+$/.test(query.kind) ? query.kind : null
  const todos = await fetchBackendData(event, '/api/v3/wiki/todos', {
    query: {
      page,
      page_size: 30,
      ...(kind ? { kind: kind as TodoKind } : {}),
      ...sectionQuery(query.section, query.type),
    },
  })
  return { todos, definitions }
}

export type CreatorTodosPageData = Awaited<ReturnType<typeof handler>>
export default definePageBffHandler(handler)
