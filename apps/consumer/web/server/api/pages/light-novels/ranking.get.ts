import { getQuery, type H3Event } from 'h3'
import { readRankingQuery } from '~/features/ranking/ranking'
import { fetchBackendData } from '../../../utils/backend-api'
import { definePageBffHandler } from '../../../utils/page-bff'

async function handler(event: H3Event) {
  const period = readRankingQuery(getQuery(event))
  const ranking = await fetchBackendData(event, '/api/v3/landing/light-novels/ranking', {
    query: { period },
  })
  return { ranking }
}

export type LightNovelsRankingPageData = Awaited<ReturnType<typeof handler>>
export default definePageBffHandler(handler)
