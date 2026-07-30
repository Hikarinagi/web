import type { MediaValue } from '../types'

const PAGE_SIZE = 30

const items = ref<MediaValue[]>([])
const loading = ref(false)
const done = ref(false)
let page = 0
let loaded = false

export function useMediaCollection() {
  async function loadMore() {
    if (loading.value || done.value) return
    loading.value = true
    try {
      const next = page + 1
      const result = await hikariRequest('/api/v3/user/me/media', {
        query: { page: next, page_size: PAGE_SIZE },
      })
      items.value.push(...result.items)
      page = next
      if (result.items.length < PAGE_SIZE || items.value.length >= result.meta.total_items) {
        done.value = true
      }
    } catch {
      done.value = true
    } finally {
      loading.value = false
    }
  }

  async function ensureLoaded() {
    if (loaded) return
    loaded = true
    await loadMore()
  }

  function prepend(media: MediaValue) {
    if (items.value.some(item => item.id === media.id)) return
    items.value = [media, ...items.value]
  }

  function remove(id: number) {
    items.value = items.value.filter(item => item.id !== id)
  }

  return { items, loading, done, loadMore, ensureLoaded, prepend, remove }
}
