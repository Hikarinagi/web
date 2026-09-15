import type { ApiPath } from '@hikarinagi/api-contract/v3'
import { FAVORITE_SEG } from '~/features/favorite/entity'
import {
  SPACE_COLLECTION_ITEM_PAGE_SIZE,
  type CollectionTypeFilterKey,
  type SpaceCollectionDetail,
  type SpaceCollectionItem,
  type SpaceCollectionItemPage,
} from '~/features/space/space'
import { usePagedList } from '~/features/space/usePagedList'

// 收藏夹详情页工作流：分页 + 类型筛选 + 收藏夹编辑/删除 + item 移除。
// 入参用 feature 别名(不 import BFF 路由类型，避免 composable→BFF 反向依赖)。
export function useCollectionDetail(data: {
  collection: SpaceCollectionDetail
  items: SpaceCollectionItemPage
  owner_id: number
}) {
  const collection = ref({ ...data.collection })
  const editOpen = ref(false)
  const deleting = ref(false)
  const activeType = ref<CollectionTypeFilterKey>('all')
  const { confirm } = useHikariConfirm()
  const backPath = computed(() => `/space/${data.owner_id}?tab=collections`)

  const { list, pending, loadPage } = usePagedList(data.items, page =>
    hikariRequest('/api/v3/favorite-collections/{collection_id}/items', {
      path: { collection_id: collection.value.id },
      query: {
        page,
        page_size: SPACE_COLLECTION_ITEM_PAGE_SIZE,
        ...(activeType.value !== 'all' ? { type: activeType.value } : {}),
      },
    }),
  )
  watch(activeType, () => loadPage(1))

  const counts = computed(() => list.value.type_counts)
  function chipCount(key: CollectionTypeFilterKey) {
    return key === 'all' ? counts.value.total : counts.value[key]
  }

  function onCollectionSaved(saved: {
    name: string
    description: string | null
    is_private: boolean
  }) {
    collection.value = {
      ...collection.value,
      name: saved.name,
      description: saved.description,
      is_private: saved.is_private,
    }
  }

  function resourceId(item: SpaceCollectionItem): number | undefined {
    return item.galgame?.id ?? item.light_novel?.id ?? item.article?.id ?? item.post?.id
  }

  async function performRemoveItem(item: SpaceCollectionItem) {
    const id = resourceId(item)
    if (!id) return
    const path =
      `/api/v3/favorite-collections/{collection_id}/${FAVORITE_SEG[item.type]}/{${item.type}_id}` as ApiPath
    await hikariRequest(path, {
      method: 'delete',
      path: { collection_id: collection.value.id, [`${item.type}_id`]: id },
    } as never)
    list.value = {
      ...list.value,
      items: list.value.items.filter(row => !(row.type === item.type && row.id === item.id)),
      meta: { ...list.value.meta, total_items: Math.max(0, list.value.meta.total_items - 1) },
      type_counts: {
        ...list.value.type_counts,
        total: Math.max(0, list.value.type_counts.total - 1),
        [item.type]: Math.max(0, list.value.type_counts[item.type] - 1),
      },
    }
  }

  function confirmRemoveItem(item: SpaceCollectionItem) {
    confirm({
      title: '移除收藏',
      description: `确认将这条移出「${collection.value.name}」？作品本身不受影响。`,
      confirmText: '移除',
      cancelText: '取消',
      tone: 'danger',
      onConfirm: () => performRemoveItem(item),
    })
  }

  async function performDeleteCollection() {
    if (deleting.value) return
    deleting.value = true
    try {
      await hikariRequest<'/api/v3/favorite-collections/{collection_id}', 'delete'>(
        '/api/v3/favorite-collections/{collection_id}',
        { method: 'DELETE', path: { collection_id: collection.value.id } },
      )
      await navigateTo(backPath.value)
    } finally {
      deleting.value = false
    }
  }

  function confirmDeleteCollection() {
    confirm({
      title: '删除收藏夹',
      description: `确认删除「${collection.value.name}」？夹内 ${counts.value.total} 项收藏将移出本夹，作品本身保留。`,
      confirmText: '删除',
      cancelText: '取消',
      tone: 'danger',
      onConfirm: () => performDeleteCollection(),
    })
  }

  return {
    collection,
    editOpen,
    activeType,
    list,
    pending,
    loadPage,
    counts,
    chipCount,
    onCollectionSaved,
    confirmRemoveItem,
    confirmDeleteCollection,
  }
}
