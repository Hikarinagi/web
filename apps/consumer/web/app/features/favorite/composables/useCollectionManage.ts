import type { ApiData } from '@hikarinagi/api-contract/v3'
import type { SpaceCollectionCard } from '~/features/space/space'

type SavedCollection = ApiData<'/api/v3/favorite-collections/{collection_id}', 'get'>

export function useCollectionManage(initial: SpaceCollectionCard[]) {
  const collections = ref<SpaceCollectionCard[]>([...initial])
  const dialogOpen = ref(false)
  const editing = ref<SpaceCollectionCard | null>(null)
  const removingId = ref<number | null>(null)
  const confirm = useConfirm()

  function openCreate() {
    editing.value = null
    dialogOpen.value = true
  }

  function openEdit(collection: SpaceCollectionCard) {
    editing.value = collection
    dialogOpen.value = true
  }

  function onSaved(saved: SavedCollection, isNew: boolean) {
    if (isNew) {
      collections.value = [...collections.value, { ...saved, item_count: 0, cover_previews: [] }]
      return
    }
    collections.value = collections.value.map(collection =>
      collection.id === saved.id
        ? {
            ...collection,
            name: saved.name,
            description: saved.description,
            is_private: saved.is_private,
          }
        : collection,
    )
  }

  async function performRemove(collection: SpaceCollectionCard, close?: () => void) {
    if (removingId.value) return
    removingId.value = collection.id
    try {
      await hikariRequest<'/api/v3/favorite-collections/{collection_id}', 'delete'>(
        '/api/v3/favorite-collections/{collection_id}',
        { method: 'DELETE', path: { collection_id: collection.id } },
      )
      collections.value = collections.value.filter(item => item.id !== collection.id)
      close?.()
    } finally {
      removingId.value = null
    }
  }

  function confirmRemove(collection: SpaceCollectionCard) {
    confirm.require({
      group: 'app-shell',
      header: '删除收藏夹',
      message: `确认删除「${collection.name}」？夹内 ${collection.item_count} 项收藏将移出本夹,作品本身保留。此操作不可撤销。`,
      acceptLabel: '删除',
      rejectLabel: '取消',
      closeOnEscape: false,
      loading: () => removingId.value === collection.id,
      onAccept: ({ close }) => void performRemove(collection, close).catch(() => {}),
    })
  }

  return { collections, dialogOpen, editing, openCreate, openEdit, onSaved, confirmRemove }
}
