import { getRouterParam, type H3Event } from 'h3'
import { fetchBackendData } from '../../../utils/backend-api'
import { definePageBffHandler } from '../../../utils/page-bff'

async function handler(event: H3Event) {
  const id = Number(getRouterParam(event, 'id'))
  const lottery = await fetchBackendData(event, '/api/v3/lotteries/{id}', { path: { id } })
  const winners =
    lottery.phase === 'ANNOUNCED'
      ? await fetchBackendData(event, '/api/v3/lotteries/{id}/winners', { path: { id } })
      : null
  return { lottery, winners }
}

export type LotteryPageData = Awaited<ReturnType<typeof handler>>
export default definePageBffHandler(handler)
