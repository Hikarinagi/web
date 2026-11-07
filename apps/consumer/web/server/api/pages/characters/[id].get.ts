import type { H3Event } from 'h3'
import {
  appearancesOf,
  defaultAppearance,
  galgameCast,
  seriesCast,
} from '~/features/character/appearances'
import { fetchBackendData } from '../../../utils/backend-api'
import { definePageBffHandler } from '../../../utils/page-bff'
import { readId } from '../../../utils/page-query'

async function handler(event: H3Event) {
  const id = readId(event)
  const query = { page: 1, page_size: 100, sort: 'recent' } as const

  const [character, galgames, light_novels, mangas, contributors] = await Promise.all([
    fetchBackendData(event, '/api/v3/characters/{id}', { path: { id } }),
    fetchBackendData(event, '/api/v3/characters/{id}/galgames', { path: { id }, query }).catch(
      () => null,
    ),
    fetchBackendData(event, '/api/v3/characters/{id}/light-novels', { path: { id }, query }).catch(
      () => null,
    ),
    fetchBackendData(event, '/api/v3/characters/{id}/mangas', { path: { id }, query }).catch(
      () => null,
    ),
    fetchBackendData(event, '/api/v3/characters/{id}/contributors', { path: { id } }),
  ])

  const work = defaultAppearance(appearancesOf({ galgames, light_novels, mangas }))
  const path = { id: work?.id ?? 0 }
  const cast = await (
    work?.kind === 'galgame'
      ? fetchBackendData(event, '/api/v3/galgames/{id}/characters', { path }).then(galgameCast)
      : work?.kind === 'light-novel'
        ? fetchBackendData(event, '/api/v3/light-novels/{id}/characters', { path }).then(seriesCast)
        : work?.kind === 'manga'
          ? fetchBackendData(event, '/api/v3/mangas/{id}/characters', { path }).then(seriesCast)
          : Promise.resolve([])
  ).catch(() => [])

  return { character, galgames, light_novels, mangas, contributors, cast }
}

export type CharacterPageData = Awaited<ReturnType<typeof handler>>
export default definePageBffHandler(handler, {
  mergedRedirect: id => `/characters/${id}`,
})
