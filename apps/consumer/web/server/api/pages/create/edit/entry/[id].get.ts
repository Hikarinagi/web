import { getRouterParam, type H3Event } from 'h3'
import { MATCHING_CODES } from '~/features/creator/entry/codes'
import { readerPath } from '~/features/creator/entry/references'
import { fetchBackendData } from '../../../../../utils/backend-api'
import { definePageBffHandler } from '../../../../../utils/page-bff'

const EDITORS: Record<string, string> = {
  galgame: '/create/edit/galgame',
  product: '/create/edit/product',
}

async function handler(event: H3Event) {
  const id = Number(getRouterParam(event, 'id'))
  const entry = await fetchBackendData(event, '/api/v3/wiki/entries/{id}', { path: { id } })
  if (entry.redirect_id) return { target: `/create/edit/entry/${entry.redirect_id}`, editor: null }
  const editor = entry.resource ? EDITORS[entry.resource.kind] : undefined
  if (editor && entry.resource) return { target: `${editor}/${entry.resource.id}`, editor: null }

  const owner = (property: string) =>
    entry.type === 'APPEARANCE'
      ? entry.statements.find(item => item.property === property && item.status !== 'DEPRECATED')
          ?.target?.id
      : undefined
  const work = owner('WORK')
  const character = owner('CHARACTER')
  const [definitions, todos, references, versions, parent] = await Promise.all([
    fetchBackendData(event, '/api/v3/wiki/definitions'),
    fetchBackendData(event, '/api/v3/wiki/todos', {
      query: { entry_id: id, page: 1, page_size: 20 },
    }),
    fetchBackendData(event, '/api/v3/wiki/entries/{id}/references', { path: { id } }),
    work
      ? fetchBackendData(event, '/api/v3/wiki/entries/{id}/references', { path: { id: work } })
      : Promise.resolve([]),
    character
      ? fetchBackendData(event, '/api/v3/wiki/entries/{id}', { path: { id: character } })
      : Promise.resolve(null),
  ])
  return {
    target: null,
    editor: {
      entry: {
        ...entry,
        statements: entry.statements.filter(
          item => item.property !== 'IDENTIFIER' || !MATCHING_CODES.includes(item.code ?? ''),
        ),
      },
      reader: readerPath(entry.resource ?? parent?.resource ?? null),
      definitions: definitions.map(definition => ({
        ...definition,
        properties: definition.properties.map(property =>
          property.property === 'IDENTIFIER' && property.codes
            ? { ...property, codes: property.codes.filter(code => !MATCHING_CODES.includes(code)) }
            : property,
        ),
      })),
      todos,
      references,
      versions: versions
        .filter(
          group =>
            (group.type === 'PRODUCT' && group.property === 'INCLUDED_GAME') ||
            (group.type === 'VOLUME' && group.property === 'SERIES'),
        )
        .flatMap(group => group.items.map(item => item.entry)),
    },
  }
}

export type EntryEditPageData = Awaited<ReturnType<typeof handler>>
export default definePageBffHandler(handler)
