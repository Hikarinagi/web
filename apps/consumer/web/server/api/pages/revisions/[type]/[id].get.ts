import { createError, getQuery, getRouterParam, type H3Event } from 'h3'
import {
  getRevisionEditPath,
  getRevisionHistoryPath,
  REVISION_RESOURCE_BASE_PATH,
  REVISION_RESOURCE_LABEL,
  REVISION_RESOURCE_TYPE,
  type RevisionResourceSlug,
} from '~/features/revision/resources'
import { fetchBackendData } from '../../../../utils/backend-api'
import { definePageBffHandler } from '../../../../utils/page-bff'

async function handler(event: H3Event) {
  const type = String(getRouterParam(event, 'type')) as RevisionResourceSlug
  const resourceType = REVISION_RESOURCE_TYPE[type]
  if (!resourceType) {
    throw createError({ statusCode: 404, statusMessage: 'Unknown revision resource' })
  }

  const id = Number(getRouterParam(event, 'id'))
  const rawQuery = getQuery(event)
  const page = Number(rawQuery.page) || 1
  const pageSize = 12

  const [resource, revisions] = await Promise.all([
    loadResource(event, type, id),
    fetchBackendData(event, '/api/v3/revisions', {
      query: {
        resource_type: resourceType as never,
        resource_id: id,
        page,
        page_size: pageSize,
      },
    }),
  ])

  const items = await Promise.all(
    revisions.items.map(async revision => ({
      ...revision,
      diff: await fetchBackendData(event, '/api/v3/revisions/{id}/diff', {
        path: { id: revision.id },
      }).catch(() => null),
    })),
  )

  return { resource, revisions: { ...revisions, items } }
}

async function loadResource(event: H3Event, type: RevisionResourceSlug, id: number) {
  if (type === 'galgame') {
    const galgame = await fetchBackendData(event, '/api/v3/galgames/{id}', { path: { id } })
    const title = galgame.trans_title || galgame.origin_title || `Galgame #${galgame.id}`
    const subtitle = title !== galgame.origin_title ? galgame.origin_title : null
    return toResource(type, id, title, subtitle)
  }

  if (type === 'light-novel') {
    const lightNovel = await fetchBackendData(event, '/api/v3/light-novels/{id}', { path: { id } })
    const title = lightNovel.name_cn || lightNovel.name || `轻小说 #${lightNovel.id}`
    const subtitle = title !== lightNovel.name ? lightNovel.name : null
    return toResource(type, id, title, subtitle)
  }

  if (type === 'person') {
    const person = await fetchBackendData(event, '/api/v3/people/{id}', { path: { id } })
    const title = person.trans_name || person.name || `人物 #${person.id}`
    const subtitle = title !== person.name ? person.name : null
    return toResource(type, id, title, subtitle)
  }

  if (type === 'character') {
    const character = await fetchBackendData(event, '/api/v3/characters/{id}', { path: { id } })
    const title = character.trans_name || character.name || `角色 #${character.id}`
    const subtitle = title !== character.name ? character.name : null
    return toResource(type, id, title, subtitle)
  }

  if (type === 'producer') {
    const producer = await fetchBackendData(event, '/api/v3/producers/{id}', { path: { id } })
    return toResource(type, id, producer.name || `厂商 #${producer.id}`, null)
  }

  if (type === 'manga') {
    const manga = await fetchBackendData(event, '/api/v3/mangas/{id}', { path: { id } })
    const title = manga.name_cn || manga.name || `漫画 #${manga.id}`
    const subtitle = title !== manga.name ? manga.name : null
    return toResource(type, id, title, subtitle)
  }

  if (type === 'manga-volume') {
    const volume = await fetchBackendData(event, '/api/v3/manga-volumes/{id}', { path: { id } })
    const manga = await fetchBackendData(event, '/api/v3/mangas/{id}', {
      path: { id: volume.series_id },
    })
    const title =
      volume.name_cn ||
      volume.name ||
      (volume.volume_number ? `第 ${volume.volume_number} 卷` : `单行本 #${id}`)
    const subtitle = manga.name_cn || manga.name || null
    return toResource(type, id, title, subtitle)
  }

  const volume = await fetchBackendData(event, '/api/v3/light-novel-volumes/{id}', {
    path: { id },
  })
  const lightNovel = await fetchBackendData(event, '/api/v3/light-novels/{id}', {
    path: { id: volume.series_id },
  })
  const title = volume.name_cn || volume.name || volume.volume_label || `轻小说卷 #${volume.id}`
  const subtitle = lightNovel.name_cn || lightNovel.name || null
  return toResource(type, id, title, subtitle)
}

function toResource(
  type: RevisionResourceSlug,
  id: number,
  title: string,
  subtitle: string | null,
) {
  return {
    id,
    type,
    label: REVISION_RESOURCE_LABEL[type],
    title,
    subtitle,
    detail_to: `${REVISION_RESOURCE_BASE_PATH[type]}/${id}`,
    edit_to: getRevisionEditPath(type, id),
  }
}

export type RevisionHistoryPageData = Awaited<ReturnType<typeof handler>>
export default definePageBffHandler(handler, {
  mergedRedirect: (id, event) =>
    getRevisionHistoryPath(String(getRouterParam(event, 'type')) as RevisionResourceSlug, id),
})
