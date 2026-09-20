import type { MangaStreamBatch } from '~~/server/api/pages/mangas.get'

type StreamModule = MangaStreamBatch['modules'][number]

const DEDUP_WINDOW = 5
const RAIL_KEEP = 8
const RAIL_MIN = 4

function moduleIds(module: StreamModule): number[] {
  if (module.kind === 'rail' || module.kind === 'grid') return module.items.map(item => item.id)
  if (module.kind === 'feature') return [module.item.id]
  if (module.kind === 'collections') {
    return module.entries.flatMap(entry => entry.covers.map(item => item.id))
  }
  return []
}

export function useHomeStream(initialCursor: number | null) {
  const modules = useState<StreamModule[]>('manga:home:modules', () => [])
  const cursor = useState<number | null>('manga:home:cursor', () => initialCursor)
  const loading = useState('manga:home:loading', () => false)
  const done = computed(() => cursor.value === null)

  async function loadMore() {
    if (loading.value || cursor.value === null) return
    loading.value = true
    try {
      const data = await $fetch<MangaStreamBatch>('/api/pages/mangas', {
        query: { cursor: cursor.value },
      })
      const gridSeen = new Set(
        modules.value.filter(m => m.kind === 'grid').flatMap(m => moduleIds(m)),
      )
      const windowSeen = new Set(modules.value.slice(-DEDUP_WINDOW).flatMap(m => moduleIds(m)))
      for (const module of data.modules) {
        if (module.kind === 'banner' || module.kind === 'collections') {
          modules.value.push(module)
          continue
        }
        if (module.kind === 'feature') {
          if (!windowSeen.has(module.item.id)) modules.value.push(module)
          continue
        }
        if (module.kind === 'rail') {
          const items = module.items.filter(item => !windowSeen.has(item.id)).slice(0, RAIL_KEEP)
          if (items.length >= RAIL_MIN) modules.value.push({ ...module, items })
          continue
        }
        const items = module.items.filter(item => !gridSeen.has(item.id))
        if (items.length) modules.value.push({ ...module, items })
      }
      cursor.value = data.next_cursor
    } catch {
      cursor.value = null
    } finally {
      loading.value = false
    }
  }

  return { modules, loading, done, loadMore }
}
