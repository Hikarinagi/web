import type { ApiData, ApiPath } from '@hikarinagi/api-contract/v3'
import { FAVORITE_SEG, type FavoriteEntityType, favoriteStateKey } from '~/features/favorite/entity'
import type { CollectionValues } from '~/features/favorite/schemas/collection.schema'

export type FavoriteCollectionRow = ApiData<
  '/api/v3/user/me/favorite/galgames/{galgame_id}/collections',
  'get'
>[number]

// POST /favorite-collections responds 201, whose ApiData is a union over all
// success codes and so isn't narrowed to the 201 body at a call site. Pick the
// fields used here from the membership row, which shares the collection shape.
type CreatedCollection = Pick<FavoriteCollectionRow, 'id' | 'name' | 'is_private' | 'is_default'>

export function useFavoriteCollections(type: FavoriteEntityType, id: number) {
  const seg = FAVORITE_SEG[type]
  const rows = ref<FavoriteCollectionRow[]>([])
  const pending = ref(false)
  const failed = ref(false)
  const savingIds = ref(new Set<number>())

  function syncToggleState() {
    const anyMember = rows.value.some(row => row.contains)
    useState(favoriteStateKey(type, id), () => anyMember).value = anyMember
  }

  async function load() {
    pending.value = true
    failed.value = false
    try {
      const path = `/api/v3/user/me/favorite/${seg}/{${type}_id}/collections` as ApiPath
      const data = await hikariRequest(path, {
        method: 'get',
        path: { [`${type}_id`]: id },
      } as never)
      rows.value = (data ?? []) as FavoriteCollectionRow[]
      syncToggleState()
    } catch {
      failed.value = true
    } finally {
      pending.value = false
    }
  }

  async function toggleIn(collectionId: number) {
    const row = rows.value.find(item => item.id === collectionId)
    if (!row || savingIds.value.has(collectionId)) return
    const next = !row.contains
    row.contains = next
    row.item_count += next ? 1 : -1
    savingIds.value = new Set(savingIds.value).add(collectionId)
    syncToggleState()
    try {
      const path = `/api/v3/favorite-collections/{collection_id}/${seg}/{${type}_id}` as ApiPath
      await hikariRequest(path, {
        method: next ? 'put' : 'delete',
        path: { collection_id: collectionId, [`${type}_id`]: id },
        ...(next ? { body: {} } : {}),
      } as never)
    } catch (error) {
      row.contains = !next
      row.item_count += next ? -1 : 1
      syncToggleState()
      throw error
    } finally {
      const nextSet = new Set(savingIds.value)
      nextSet.delete(collectionId)
      savingIds.value = nextSet
    }
  }

  async function create(values: CollectionValues) {
    const collection = (await hikariRequest<'/api/v3/favorite-collections', 'post'>(
      '/api/v3/favorite-collections',
      { method: 'post', body: values },
    )) as CreatedCollection
    const path = `/api/v3/favorite-collections/{collection_id}/${seg}/{${type}_id}` as ApiPath
    await hikariRequest(path, {
      method: 'put',
      path: { collection_id: collection.id, [`${type}_id`]: id },
      body: {},
    } as never)
    rows.value = [
      {
        id: collection.id,
        name: collection.name,
        is_private: collection.is_private,
        is_default: collection.is_default,
        item_count: 1,
        contains: true,
      },
      ...rows.value,
    ]
    syncToggleState()
  }

  return { rows, pending, failed, savingIds, load, toggleIn, create }
}
