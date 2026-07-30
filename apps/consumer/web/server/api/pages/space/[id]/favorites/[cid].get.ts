import { getRouterParam, type H3Event } from 'h3'
import { collectionItemCover } from '~/features/space/server/page-bff'
import { SPACE_COLLECTION_ITEM_PAGE_SIZE } from '~/features/space/space'
import { fetchBackendData } from '../../../../../utils/backend-api'
import { definePageBffHandler } from '../../../../../utils/page-bff'
import { readPage } from '../../../../../utils/page-query'

async function handler(event: H3Event) {
  const id = Number(getRouterParam(event, 'id'))
  const cid = Number(getRouterParam(event, 'cid'))
  const page = readPage(event)

  const [me, owner, collection, items] = await Promise.all([
    fetchBackendData(event, '/api/v3/user/me').catch(() => null),
    fetchBackendData(event, '/api/v3/user/{id}', { path: { id } }),
    fetchBackendData(event, '/api/v3/favorite-collections/{collection_id}', {
      path: { collection_id: cid },
    }),
    fetchBackendData(event, '/api/v3/favorite-collections/{collection_id}/items', {
      path: { collection_id: cid },
      query: { page, page_size: SPACE_COLLECTION_ITEM_PAGE_SIZE },
    }),
  ])

  const is_self = me?.id === collection.owner_id
  const first = items.items[0]
  const cover = first ? collectionItemCover(first) : null

  return { owner_id: id, is_self, owner, collection, items, cover }
}

export type SpaceCollectionDetailPageData = Awaited<ReturnType<typeof handler>>
export default definePageBffHandler(handler)
