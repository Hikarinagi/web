import { getQuery, type H3Event } from 'h3'
import { readPrizeQuery } from '~/features/lottery/results'
import { fetchBackendData } from '../../../utils/backend-api'
import { definePageBffHandler } from '../../../utils/page-bff'

async function handler(event: H3Event) {
  const state = readPrizeQuery(getQuery(event))
  const list = await fetchBackendData(event, '/api/v3/user/me/lottery/prizes', {
    query: { page: state.page, page_size: state.page_size },
  })
  return { list, state }
}

export type PrizesPageData = Awaited<ReturnType<typeof handler>>
export default definePageBffHandler(handler)
