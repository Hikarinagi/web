import { getQuery, type H3Event } from 'h3'
import { fetchBackendData } from '~~/server/utils/backend-api'
import { definePageBffHandler } from '~~/server/utils/page-bff'

function readPeerId(value: unknown): number | null {
  const raw = Array.isArray(value) ? value[0] : value
  const n = Number(raw)
  return Number.isInteger(n) && n > 0 ? n : null
}

async function handler(event: H3Event) {
  const peerId = readPeerId(getQuery(event).peer)

  const [conversations, thread] = await Promise.all([
    fetchBackendData(event, '/api/v3/user/me/conversations', {
      query: { page: 1, page_size: 50 },
    }),
    peerId != null
      ? fetchBackendData(event, '/api/v3/user/me/conversations/{peerId}/messages', {
          path: { peerId },
          query: { limit: 30 },
        })
      : Promise.resolve(null),
  ])

  return { conversations, thread, peerId }
}

export type DmPageData = Awaited<ReturnType<typeof handler>>
export default definePageBffHandler(handler)
