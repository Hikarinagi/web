import { createError, getRouterParam, type H3Event } from 'h3'
import { MATCHING_CODES } from '~/features/wiki/codes'
import type { EditableEntry } from '~/features/wiki/editor/draft'
import type { ReferenceGroup } from '~/features/wiki/references'
import { codeLabel, dateText } from '~/features/wiki/values'
import { fetchBackendData } from '~~/server/utils/backend-api'
import { definePageBffHandler } from '~~/server/utils/page-bff'

function targetOf(entry: EditableEntry, property: string): number | undefined {
  return entry.statements.find(item => item.property === property && item.status !== 'DEPRECATED')
    ?.target?.id
}

async function editorOf(event: H3Event, entry: EditableEntry): Promise<string | null> {
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

async function handler(event: H3Event) {
  const id = Number(getRouterParam(event, 'id'))
  if (!Number.isInteger(id) || id < 1) {
    throw createError({ statusCode: 400, statusMessage: 'Bad Request' })
  }
  const entry = await fetchBackendData(event, '/api/v3/wiki/entries/{id}', { path: { id } })
  const redirect = await editorOf(event, entry)
  if (redirect)
    return { redirect, entry: null, parts: [], versions: [], definitions: [], owner: null }
  const owner =
    entry.type === 'APPEARANCE'
      ? (entry.statements.find(item => item.property === 'WORK' && item.status !== 'DEPRECATED')
          ?.target ?? null)
      : null
  const [definitions, parts, references] = await Promise.all([
    fetchBackendData(event, '/api/v3/wiki/definitions'),
    ['GAME', 'SERIES', 'APPEARANCE'].includes(entry.type)
      ? fetchBackendData(event, '/api/v3/wiki/entries/{id}/parts', { path: { id } })
      : Promise.resolve<EditableEntry[]>([]),
    owner?.type === 'GAME'
      ? fetchBackendData(event, '/api/v3/wiki/entries/{id}/references', { path: { id: owner.id } })
      : Promise.resolve<ReferenceGroup[]>([]),
  ])
  const visible = (item: EditableEntry): EditableEntry => ({
    ...item,
    statements: item.statements.filter(
      statement =>
        statement.property !== 'IDENTIFIER' || !MATCHING_CODES.includes(statement.code ?? ''),
    ),
  })
  const versions =
    owner?.type === 'GAME'
      ? references
          .filter(group => group.type === 'PRODUCT' && group.property === 'INCLUDED_GAME')
          .flatMap(group =>
            group.items.map(item => ({
              ...item.entry,
              label: item.entry.label || '未命名的发行版本',
            })),
          )
      : parts
          .filter(item => item.type === 'PRODUCT' || item.type === 'BOOK')
          .map(item => {
            const live = item.statements.filter(statement => statement.status !== 'DEPRECATED')
            const date = live.find(statement => statement.property === 'RELEASE_DATE')
            const facts = [
              ...live.flatMap(statement =>
                statement.property === 'PLATFORM' && statement.code
                  ? [codeLabel('PLATFORM', statement.code)]
                  : [],
              ),
              date?.date ? dateText(date.date, date.date_precision) : '',
            ].filter(Boolean)
            const fallback = item.type === 'PRODUCT' ? '未命名的发行版本' : '未命名的出版版本'
            return {
              id: item.id,
              type: item.type,
              label: item.label || facts.join('，') || fallback,
            }
          })
  return {
    redirect: null,
    entry: visible(entry),
    parts: parts.map(visible),
    versions,
    owner,
    definitions: definitions.map(definition => ({
      ...definition,
      properties: definition.properties.map(property =>
        property.property === 'IDENTIFIER' && property.codes
          ? { ...property, codes: property.codes.filter(code => !MATCHING_CODES.includes(code)) }
          : property,
      ),
    })),
  }
}

export type EditorPageData = Awaited<ReturnType<typeof handler>>
export default definePageBffHandler(handler)
