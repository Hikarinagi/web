import { getQuery, type H3Event } from 'h3'
import { readCalendarQuery } from '~/features/galgame/calendar'
import { fetchBackendData } from '../../../utils/backend-api'
import { definePageBffHandler } from '../../../utils/page-bff'

async function handler(event: H3Event) {
  const calendar = await fetchBackendData(event, '/api/v3/landing/galgames/calendar', {
    query: { month: readCalendarQuery(getQuery(event)) },
  })
  return { calendar }
}

export type GalgamesCalendarPageData = Awaited<ReturnType<typeof handler>>
export default definePageBffHandler(handler)
