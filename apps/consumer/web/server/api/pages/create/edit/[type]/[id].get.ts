import { createError, getRouterParam, type H3Event } from 'h3'
import { fetchBackendData } from '../../../../../utils/backend-api'
import { definePageBffHandler } from '../../../../../utils/page-bff'

const KINDS = {
  galgame: 'galgame',
  'light-novel': 'light_novel',
  'light-novel-volume': 'light_novel_volume',
  manga: 'manga',
  'manga-volume': 'manga_volume',
  person: 'person',
  character: 'character',
  producer: 'producer',
} as const

async function handler(event: H3Event) {
  const type = getRouterParam(event, 'type') ?? ''
  const kind = KINDS[type as keyof typeof KINDS]
  if (!kind) throw createError({ statusCode: 404, statusMessage: 'Not found' })
  const id = Number(getRouterParam(event, 'id'))
  const resource = await fetchBackendData(event, '/api/v3/wiki/resources/{kind}/{id}', {
    path: { kind, id },
  })
  return { target: `/create/edit/entry/${resource.entry_id}` }
}

export type EditRedirectPageData = Awaited<ReturnType<typeof handler>>
export default definePageBffHandler(handler)
