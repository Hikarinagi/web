import type { ApiData } from '@hikarinagi/api-contract/v3'

type PendingItem = ApiData<'/api/v3/change-requests', 'get'>['items'][number]

export interface ReviewQueueEntry {
  id: number
  primary: PendingItem
  bundled: PendingItem[]
}

const WORK_TYPES = new Set(['GALGAME', 'LIGHT_NOVEL', 'LIGHT_NOVEL_VOLUME'])

export function groupByBatch(items: PendingItem[]): ReviewQueueEntry[] {
  const entries: ReviewQueueEntry[] = []
  const byBatch = new Map<string, ReviewQueueEntry>()
  for (const item of items) {
    if (!item.batch_id) {
      entries.push({ id: item.id, primary: item, bundled: [] })
      continue
    }
    const entry = byBatch.get(item.batch_id)
    if (!entry) {
      const fresh = { id: item.id, primary: item, bundled: [] }
      byBatch.set(item.batch_id, fresh)
      entries.push(fresh)
      continue
    }
    if (WORK_TYPES.has(item.resource_type) && !WORK_TYPES.has(entry.primary.resource_type)) {
      entry.bundled.push(entry.primary)
      entry.primary = item
      entry.id = item.id
    } else {
      entry.bundled.push(item)
    }
  }
  return entries
}
