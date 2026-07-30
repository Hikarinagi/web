import type { BackendFeedItem, FeedResponse } from './feed'
import type { FeedSource } from './sources'

interface FeedBucket {
  items: BackendFeedItem[]
  nextCursor: string | null
  loaded: boolean
}

function emptyBucket(): FeedBucket {
  return { items: [], nextCursor: null, loaded: false }
}

// clone items —— seed 是 useHikariApiData 的缓存对象,直接引用会让 loadMore 的 push 反向污染 BFF payload。
function bucketFrom(res: FeedResponse): FeedBucket {
  return { items: [...res.items], nextCursor: res.meta.next_cursor, loaded: true }
}

// 跨导航保活的 feed 累积状态,放在 useState(Nuxt app-level state,非 Pinia)。一个 source 一个桶,
// 桶 key = source.key、所在 store = source.storeId。首页 recommend/following 共用 'feed:stream'
// 双桶(scope 即 key);topic/section 各用 'feed:relation:<type>:<id>' 独立 store。切到详情页再返回时,
// 列表 + 游标都还在。首屏(SSR seed)在 useState factory 里一次性装入当前 key 的桶;其余 key 懒加载。
export function useFeedStream(source: FeedSource) {
  const buckets = useState<Record<string, FeedBucket>>(source.storeId, () => {
    const seeded = source.seed()
    return { [source.key]: seeded ? bucketFrom(seeded) : emptyBucket() }
  })
  // per-key:既是加载指示,也是并发去重锁(同 key 同时只跑一个请求)。
  const loadingMap = useState<Record<string, boolean>>(`${source.storeId}:loading`, () => ({}))

  function bucketFor(): FeedBucket {
    if (!buckets.value[source.key]) buckets.value[source.key] = emptyBucket()
    return buckets.value[source.key]!
  }

  const bucket = computed(() => buckets.value[source.key] ?? emptyBucket())
  const items = computed(() => bucket.value.items)
  const nextCursor = computed(() => bucket.value.nextCursor)
  const loaded = computed(() => bucket.value.loaded)
  const loading = computed(() => !!loadingMap.value[source.key])

  // 装载首页(已 loaded 或正在加载则跳过)。首屏由 factory seed;这里负责未 seed 的 source(首页
  // following、reset 后)的按需拉取。
  async function ensure() {
    const b = bucketFor()
    if (b.loaded || loadingMap.value[source.key]) return
    loadingMap.value[source.key] = true
    try {
      const res = await source.fetch(null)
      b.items = res.items
      b.nextCursor = res.meta.next_cursor
      b.loaded = true
    } finally {
      loadingMap.value[source.key] = false
    }
  }

  async function loadMore() {
    const b = bucketFor()
    if (loadingMap.value[source.key] || !b.nextCursor) return
    loadingMap.value[source.key] = true
    try {
      const res = await source.fetch(b.nextCursor)
      b.items.push(...res.items)
      b.nextCursor = res.meta.next_cursor
    } finally {
      loadingMap.value[source.key] = false
    }
  }

  async function refresh() {
    const b = bucketFor()
    if (loadingMap.value[source.key]) return false
    loadingMap.value[source.key] = true
    try {
      const res = await source.fetch(null)
      b.items = res.items
      b.nextCursor = res.meta.next_cursor
      b.loaded = true
      return true
    } finally {
      loadingMap.value[source.key] = false
    }
  }

  return { items, nextCursor, loading, loaded, ensure, loadMore, refresh }
}

// 登录态变化 → 首页 feed 个性化结果改变 → 由首页统一清空 'feed:stream' 所有桶(recommend/following)。
export function useFeedReset() {
  const buckets = useState<Record<string, FeedBucket>>('feed:stream')
  return () => {
    if (!buckets.value) return
    for (const key of Object.keys(buckets.value)) buckets.value[key] = emptyBucket()
  }
}

export function usePrependFeed(storeId = 'feed:stream') {
  const buckets = useState<Record<string, FeedBucket>>(storeId)
  return (item: BackendFeedItem) => {
    if (!buckets.value) return
    for (const key of Object.keys(buckets.value)) {
      const b = buckets.value[key]!
      if (b.loaded) b.items = [item, ...b.items]
    }
  }
}
