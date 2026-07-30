import type { H3Event } from 'h3'
import { fetchBackendData } from '../../../utils/backend-api'
import { definePageBffHandler } from '../../../utils/page-bff'

async function fetchAllDecorations(event: H3Event) {
  const first = await fetchBackendData(event, '/api/v3/decorations', {
    query: { page: 1, page_size: 100 },
  })
  const items = [...first.items]
  for (let page = 2; page <= first.meta.total_pages; page++) {
    const next = await fetchBackendData(event, '/api/v3/decorations', {
      query: { page, page_size: 100 },
    })
    items.push(...next.items)
  }
  return items
}

async function handler(event: H3Event) {
  const [owned, catalog, status] = await Promise.all([
    fetchBackendData(event, '/api/v3/user/me/decorations'),
    fetchAllDecorations(event),
    fetchBackendData(event, '/api/v3/user/me/status'),
  ])
  return {
    equipped_frame_id: owned.equipped_frame_id,
    equipped_badge_ids: owned.equipped_badge_ids,
    owned: owned.items,
    catalog,
    points: status.hikari_point,
  }
}

export type DecorationPageData = Awaited<ReturnType<typeof handler>>
export default definePageBffHandler(handler)
