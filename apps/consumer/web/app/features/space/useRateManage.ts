import type { GalgameRate, UpsertGalgameRateBody } from '~/features/galgame/rate'
import type { LightNovelRate, UpsertLightNovelRateBody } from '~/features/light-novel/rate'
import type { MangaRate, UpsertMangaRateBody } from '~/features/manga/rate'
import type { SpaceRateItem } from './space'

export function useRateManage(reload: () => Promise<unknown>) {
  const editing = ref<SpaceRateItem | null>(null)
  const rate = ref<GalgameRate | LightNovelRate | MangaRate | null>(null)
  const visible = ref(false)
  const loadingId = ref<string | null>(null)

  const keyOf = (item: SpaceRateItem) => `${item.work_type}:${item.id}`

  async function edit(item: SpaceRateItem) {
    if (loadingId.value) return
    loadingId.value = keyOf(item)
    try {
      rate.value =
        item.work_type === 'GALGAME'
          ? await hikariRequest('/api/v3/galgames/{id}/rate', { path: { id: item.id } })
          : item.work_type === 'MANGA'
            ? await hikariRequest('/api/v3/mangas/{id}/rate', { path: { id: item.id } })
            : await hikariRequest('/api/v3/light-novels/{id}/rate', { path: { id: item.id } })
      editing.value = item
      visible.value = true
    } finally {
      loadingId.value = null
    }
  }

  async function upsertGalgame(body: UpsertGalgameRateBody) {
    const id = editing.value?.id
    if (id == null) return null
    const saved = await hikariRequest<'/api/v3/galgames/{id}/rate', 'put'>(
      '/api/v3/galgames/{id}/rate',
      { method: 'put', path: { id }, body },
    )
    await reload()
    return saved
  }

  async function upsertLightNovel(body: UpsertLightNovelRateBody) {
    const id = editing.value?.id
    if (id == null) return null
    const saved = await hikariRequest<'/api/v3/light-novels/{id}/rate', 'put'>(
      '/api/v3/light-novels/{id}/rate',
      { method: 'put', path: { id }, body },
    )
    await reload()
    return saved
  }

  async function upsertManga(body: UpsertMangaRateBody) {
    const id = editing.value?.id
    if (id == null) return null
    const saved = await hikariRequest<'/api/v3/mangas/{id}/rate', 'put'>(
      '/api/v3/mangas/{id}/rate',
      { method: 'put', path: { id }, body },
    )
    await reload()
    return saved
  }

  async function drop() {
    const item = editing.value
    if (!item) return
    if (item.work_type === 'GALGAME') {
      await hikariRequest<'/api/v3/galgames/{id}/rate', 'delete'>('/api/v3/galgames/{id}/rate', {
        method: 'delete',
        path: { id: item.id },
      })
    } else if (item.work_type === 'MANGA') {
      await hikariRequest<'/api/v3/mangas/{id}/rate', 'delete'>('/api/v3/mangas/{id}/rate', {
        method: 'delete',
        path: { id: item.id },
      })
    } else {
      await hikariRequest<'/api/v3/light-novels/{id}/rate', 'delete'>(
        '/api/v3/light-novels/{id}/rate',
        { method: 'delete', path: { id: item.id } },
      )
    }
    await reload()
  }

  return {
    editing,
    rate,
    visible,
    loadingId,
    keyOf,
    edit,
    upsertGalgame,
    upsertLightNovel,
    upsertManga,
    drop,
  }
}
