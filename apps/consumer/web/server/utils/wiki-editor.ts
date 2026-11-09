import type { H3Event } from 'h3'
import type { EditableEntry } from '~/features/wiki/editor/draft'
import { fetchBackendData } from '~~/server/utils/backend-api'

function targetOf(entry: EditableEntry, property: string): number | undefined {
  return entry.statements.find(item => item.property === property && item.status !== 'DEPRECATED')
    ?.target?.id
}

export async function editorTarget(event: H3Event, entry: EditableEntry): Promise<string | null> {
  if (entry.redirect_id) return `/entries/${entry.redirect_id}/edit`
  if (entry.type === 'PRODUCT') {
    const game = targetOf(entry, 'INCLUDED_GAME')
    return game ? `/entries/${game}/edit/releases/${entry.id}` : null
  }
  if (entry.type === 'VOLUME') {
    const series = targetOf(entry, 'SERIES')
    return series ? `/entries/${series}/edit/volumes/${entry.id}` : null
  }
  if (entry.type === 'BOOK') {
    const volume = targetOf(entry, 'INCLUDED_VOLUME')
    if (!volume) return null
    const owner = await fetchBackendData(event, '/api/v3/wiki/entries/{id}', {
      path: { id: volume },
    })
    const series = targetOf(owner, 'SERIES')
    return series ? `/entries/${series}/edit/volumes/${volume}/${entry.id}` : null
  }
  if (entry.type === 'CHARACTER') {
    const groups = await fetchBackendData(event, '/api/v3/wiki/entries/{id}/references', {
      path: { id: entry.id },
    })
    const appearance = groups.find(group => group.type === 'APPEARANCE')?.items[0]?.entry.id
    return appearance ? `/entries/${appearance}/edit` : null
  }
  return null
}
