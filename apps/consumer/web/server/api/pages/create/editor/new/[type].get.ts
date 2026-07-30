import type { ApiData } from '@hikarinagi/api-contract/v3'
import type { BackendEditorRef } from '~/features/creator/editor'
import { getQuery, getRouterParam, type H3Event } from 'h3'
import { fetchBackendData } from '../../../../../utils/backend-api'
import { definePageBffHandler } from '../../../../../utils/page-bff'
import type { CreatorEditorPageData } from '../[type]/[id].get'

type DraftData = ApiData<'/api/v3/external-source/galgame-draft', 'get'>
export type PrefillRelations = Pick<
  DraftData,
  'producers' | 'staff' | 'characters' | 'relations' | 'tags'
>

async function handler(event: H3Event) {
  const type = String(getRouterParam(event, 'type'))
  const query = getQuery(event)
  const bangumiId = typeof query.bangumi_id === 'string' ? query.bangumi_id : undefined
  const vndbId = typeof query.vndb_id === 'string' ? query.vndb_id : undefined

  const schema = await fetchBackendData(event, '/api/v3/contribution/schemas/{resource_type}', {
    path: { resource_type: type },
  })

  let prefill: Record<string, unknown> = {}
  let prefill_cover: string | null = null
  let prefill_relations: PrefillRelations | null = null
  let existing_id: number | null = null
  let sources_match: boolean | null = null
  let screenshots: DraftData['screenshots'] = []

  if (bangumiId || vndbId) {
    if (type === 'galgame') {
      const result = await fetchBackendData(event, '/api/v3/external-source/galgame-draft', {
        query: { bangumi_id: bangumiId, vndb_id: vndbId },
      })
      prefill = result.draft
      prefill_cover = result.cover
      existing_id = result.existing_id
      sources_match = result.sources_match
      prefill_relations = {
        producers: result.producers,
        staff: result.staff,
        characters: result.characters,
        relations: result.relations,
        tags: result.tags,
      }
      screenshots = result.screenshots
    } else if (type === 'person' || type === 'character' || type === 'producer') {
      const result = await fetchBackendData(event, '/api/v3/external-source/entity-draft', {
        query: { type, bangumi_id: bangumiId, vndb_id: vndbId },
      })
      prefill = result.draft
      prefill_cover = result.cover
      existing_id = result.existing_id
      sources_match = result.sources_match
    } else if (type === 'light-novel' && bangumiId) {
      const result = await fetchBackendData(event, '/api/v3/external-source/light-novel-draft', {
        query: { bangumi_id: bangumiId },
      })
      prefill = result.draft
      prefill_cover = result.cover
      existing_id = result.existing_id
    } else if (type === 'light-novel-volume' && bangumiId) {
      const result = await fetchBackendData(
        event,
        '/api/v3/external-source/light-novel-volume-draft',
        { query: { bangumi_id: bangumiId } },
      )
      prefill = result.draft
      prefill_cover = result.cover
      existing_id = result.existing_id
    }
  }

  if (prefill_cover) {
    try {
      const media = await fetchBackendData(event, '/api/v3/external-source/cover-media', {
        method: 'POST',
        body: { url: prefill_cover },
      })
      if (type === 'person' || type === 'character') {
        prefill = { ...prefill, image: { id: media.id, src: media.src } }
      } else if (type === 'producer') {
        prefill = { ...prefill, logo: { id: media.id, src: media.src } }
      } else {
        prefill = {
          ...prefill,
          covers: [
            {
              target_id: media.id,
              target: { name: '', cover: media.src },
              attributes: { sexual: 0, violence: 0 },
            },
          ],
        }
      }
    } catch {
      prefill_cover = null
    }
  }

  if (screenshots.length) {
    const rows = await Promise.all(
      screenshots.map(async shot => {
        try {
          const media = await fetchBackendData(event, '/api/v3/external-source/cover-media', {
            method: 'POST',
            body: { url: shot.url },
          })
          return {
            target_id: media.id,
            target: { name: '', cover: media.src },
            attributes: { sexual: shot.sexual, violence: shot.violence },
          }
        } catch {
          return null
        }
      }),
    )
    const images = rows
      .filter(row => row != null)
      .map((row, index) => ({ ...row, attributes: { ...row.attributes, order: index } }))
    if (images.length) prefill = { ...prefill, images }
  }

  return {
    schema,
    snapshot: {} as CreatorEditorPageData['snapshot'],
    prefill,
    prefill_cover,
    prefill_relations,
    sources_match,
    existing_id,
    refs: {} as Record<string, BackendEditorRef>,
    resource: null,
    open_change_request: null,
  }
}

export type CreatorNewEditorPageData = Awaited<ReturnType<typeof handler>>
export default definePageBffHandler(handler)
