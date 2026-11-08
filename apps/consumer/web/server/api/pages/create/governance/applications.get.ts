import { getQuery, type H3Event } from 'h3'
import { fetchBackendData } from '../../../../utils/backend-api'
import { definePageBffHandler } from '../../../../utils/page-bff'

const STATUSES = ['PENDING', 'APPROVED', 'REJECTED'] as const
type ApplicationStatusQuery = (typeof STATUSES)[number]

function parseStatus(raw: unknown): ApplicationStatusQuery | undefined {
  return typeof raw === 'string' && STATUSES.includes(raw as ApplicationStatusQuery)
    ? (raw as ApplicationStatusQuery)
    : undefined
}

async function handler(event: H3Event) {
  const rawQuery = getQuery(event)
  const applications = await fetchBackendData(event, '/api/v3/review-group-applications', {
    query: {
      page: Number(rawQuery.page) || 1,
      page_size: Number(rawQuery.page_size) || 20,
      status: parseStatus(rawQuery.status),
    },
  })
  return { applications }
}

export type CreatorGovernanceApplicationsPageData = Awaited<ReturnType<typeof handler>>
export default definePageBffHandler(handler)
