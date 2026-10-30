import { getQuery, type H3Event } from 'h3'
import { sectionQuery } from '~/features/creator/sections'
import { fetchBackendData } from '../../../utils/backend-api'
import { definePageBffHandler } from '../../../utils/page-bff'

const FILTERS = [
  'unpatrolled',
  'new_members',
  'deletions',
  'work_content',
  'structural',
  'bot',
] as const

async function handler(event: H3Event) {
  const query = getQuery(event)
  const page = Number(query.page) || 1
  const filter = FILTERS.find(item => item === query.filter)
  const task = Number(query.task) > 0 ? Number(query.task) : undefined
  const definitions = await fetchBackendData(event, '/api/v3/wiki/definitions')
  const changes = await fetchBackendData(event, '/api/v3/wiki/changes', {
    query: {
      page,
      page_size: 30,
      ...(filter ? { [filter]: true } : {}),
      ...(task ? { task_id: task } : {}),
      ...sectionQuery(query.section, query.type),
    },
  })
  return {
    changes,
    task: task
      ? (changes.items.find(item => item.batch.task?.id === task)?.batch.task ?? null)
      : null,
    types: definitions.map(item => ({ value: item.type, label: item.label })),
  }
}

export type CreatorChangesPageData = Awaited<ReturnType<typeof handler>>
export default definePageBffHandler(handler)
