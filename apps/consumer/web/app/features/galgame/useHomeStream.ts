import type { GalgameStreamData } from '~~/server/api/pages/galgames/stream.get'

type StreamModule = GalgameStreamData['modules'][number]

const DEDUP_WINDOW = 5
const RAIL_KEEP = 12
const RAIL_MIN = 6

function moduleIds(module: StreamModule): number[] {
  return module.kind === 'feature' ? [module.item.id] : module.items.map(item => item.id)
}

export function useGalgameHomeStream() {
  const auth = useAuthStore()
  const modules = useState<StreamModule[]>('galgame:home:v3:modules', () => [])
  const cursor = useState<number | null>('galgame:home:v3:cursor', () => 0)
  const loading = useState('galgame:home:v3:loading', () => false)
  const failed = useState('galgame:home:v3:failed', () => false)
  const generation = useState('galgame:home:v3:generation', () => 0)
  const streamDate = useState('galgame:home:v3:date', () => new Date().toISOString().slice(0, 10))
  const streamViewer = useState('galgame:home:v3:viewer', () => '')
  const requestQuery = reactive({ cursor: 0 })
  const { data, error, execute } = useHikariApiData<GalgameStreamData>(
    '/api/pages/galgames/stream',
    {
      immediate: false,
      query: requestQuery,
      watch: false,
    },
  )
  const done = computed(() => cursor.value === null)

  function reset() {
    generation.value += 1
    modules.value = []
    cursor.value = 0
    loading.value = false
    failed.value = false
  }

  const viewer = computed(
    () =>
      `${auth.user?.id ?? 'guest'}:${auth.user?.content_limit ?? 'NEVER_SHOW_NSFW_CONTENT'}:${auth.user?.hide_otome ?? true}`,
  )
  const today = new Date().toISOString().slice(0, 10)
  if (streamDate.value !== today) {
    reset()
    streamDate.value = today
  }
  if (streamViewer.value !== viewer.value) {
    reset()
    streamViewer.value = viewer.value
  }

  watch(viewer, current => {
    reset()
    streamViewer.value = current
  })

  async function loadMore() {
    if (loading.value || cursor.value === null) return
    const requestGeneration = generation.value
    loading.value = true
    failed.value = false
    requestQuery.cursor = cursor.value

    try {
      await execute()
      if (requestGeneration !== generation.value) return
      if (error.value || !data.value) {
        failed.value = true
        return
      }

      const gridSeen = new Set(
        modules.value.filter(module => module.kind === 'grid').flatMap(module => moduleIds(module)),
      )
      const windowSeen = new Set(
        modules.value.slice(-DEDUP_WINDOW).flatMap(module => moduleIds(module)),
      )
      for (const module of data.value.modules) {
        if (module.kind === 'feature') {
          if (!windowSeen.has(module.item.id)) modules.value.push(module)
          continue
        }

        const seen = module.kind === 'rail' ? windowSeen : gridSeen
        const items = module.items
          .filter(item => !seen.has(item.id))
          .slice(0, module.kind === 'rail' ? RAIL_KEEP : undefined)
        if (!items.length || (module.kind === 'rail' && items.length < RAIL_MIN)) continue
        modules.value.push({ ...module, items })
      }
      cursor.value = data.value.next_cursor
    } catch {
      if (requestGeneration === generation.value) failed.value = true
    } finally {
      if (requestGeneration === generation.value) loading.value = false
    }
  }

  return { modules, loading, failed, done, loadMore }
}
