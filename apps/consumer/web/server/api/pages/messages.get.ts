import { getQuery, type H3Event } from 'h3'
import { backendType, readMessagesQuery } from '~/features/notifications/results'
import { fetchBackendData } from '~~/server/utils/backend-api'
import { definePageBffHandler } from '~~/server/utils/page-bff'

async function handler(event: H3Event) {
  const state = readMessagesQuery(getQuery(event))
  const type = backendType(state.type)

  const [page, summary] = await Promise.all([
    fetchBackendData(event, '/api/v3/system-messages', {
      query: {
        page: state.page,
        page_size: state.page_size,
        ...(type ? { type } : {}),
      },
    }),
    fetchBackendData(event, '/api/v3/system-messages/unread/summary'),
  ])

  return { page, summary, state }
}

export type MessagesPageData = Awaited<ReturnType<typeof handler>>
export default definePageBffHandler(handler)
