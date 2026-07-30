import { ChevronUp, RefreshCw } from '@lucide/vue'
import { push } from 'notivue'
import type { Ref } from 'vue'
import { clusterFeed, feedItemBlocksNsfw, foldFeed } from './feed'
import { feedKey } from './height'
import type { FeedSource } from './sources'
import { useFeedStream } from './useFeedStream'
import { useFeedVirtualList } from './useFeedVirtualList'

const TOP_REFRESH_OFFSET = 64
const TOP_REFRESH_MIN_MS = 520
const TOP_SCROLL_TOLERANCE = 2
const TOP_SCROLL_TIMEOUT_MS = 1800

export function useFeedList(source: FeedSource, active: Ref<boolean>) {
  const { items, nextCursor, loading, loaded, ensure, loadMore, refresh } = useFeedStream(source)
  const { shouldBlockNsfw } = useNsfwPolicy()
  const toolbar = useFloatingToolbar()
  const topRefreshing = ref(false)
  const topRefreshOpen = ref(false)
  // 深翻页:触发过第一次 load more 即为「深」;refresh / feed 重置后归 false
  const deep = ref(false)
  const topRefreshY = computed(() => (topRefreshOpen.value ? TOP_REFRESH_OFFSET : 0))
  const showFooterLoading = computed(() => loading.value && !topRefreshOpen.value)
  const visibleItems = computed(() =>
    items.value.filter(item => !shouldBlockNsfw(feedItemBlocksNsfw(item))),
  )
  const displayRows = computed(() => clusterFeed(foldFeed(visibleItems.value)))
  const emptyText = computed(() => source.emptyText)
  const sentinel = ref<HTMLElement | null>(null)
  const cacheKey = `${source.storeId}:${source.key}`
  const virtual = useFeedVirtualList(displayRows, { active, cacheKey })

  if (active.value) ensureSource()
  watch(active, a => {
    if (a) ensureSource()
  })
  watch(loaded, l => {
    if (!l) deep.value = false
    if (!l && active.value) ensureSource()
  })

  // source.guard:首页 following 对游客无意义(兜 logout 时序边界,避免以 guest 身份打接口);
  // topic/section 无 guard,游客可看。
  function ensureSource() {
    if (source.guard && !source.guard()) return
    void ensure()
  }

  useIntersectionObserver(
    sentinel,
    ([entry]) => {
      if (entry?.isIntersecting && !loading.value && nextCursor.value) {
        deep.value = true
        loadMore()
      }
    },
    { rootMargin: '400px' },
  )

  // 顶栏「回到顶部」只由当前激活的实例接管;隐藏实例必须摘除注册,否则 at(-1) 会取错
  const topHandlerId = `feed-list-refresh:${cacheKey}`
  const activated = ref(true)
  onActivated(() => {
    activated.value = true
  })
  onDeactivated(() => {
    activated.value = false
  })
  watchEffect(() => {
    if (active.value && activated.value) {
      toolbar.setTopHandler(topHandlerId, refreshTop, {
        icon: () => (deep.value ? RefreshCw : ChevronUp),
        label: () => (deep.value ? '回到顶部并刷新' : '回到顶部'),
      })
    } else {
      toolbar.removeTopHandler(topHandlerId)
    }
  })
  onBeforeUnmount(() => {
    toolbar.removeTopHandler(topHandlerId)
  })

  async function refreshTop() {
    if (!import.meta.client) return

    // 未深翻页:只回顶,不刷新(不打断、不丢位置/新鲜度)
    if (!deep.value) {
      await scrollToTop()
      return
    }

    if (topRefreshing.value) return
    topRefreshing.value = true

    try {
      const reachedTop = await scrollToTop()
      if (!reachedTop || loading.value) return

      const beforeKeys = new Set(items.value.map(feedKey))
      topRefreshOpen.value = true

      await Promise.all([
        refresh(),
        new Promise(resolve => window.setTimeout(resolve, TOP_REFRESH_MIN_MS)),
      ])
      notifyRefresh(countFreshItems(beforeKeys))
      deep.value = false
    } finally {
      topRefreshOpen.value = false
      topRefreshing.value = false
    }
  }

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    if (window.scrollY <= TOP_SCROLL_TOLERANCE) return Promise.resolve(true)

    const startedAt = window.performance.now()
    return new Promise<boolean>(resolve => {
      const tick = () => {
        if (window.scrollY <= TOP_SCROLL_TOLERANCE) {
          resolve(true)
          return
        }

        if (window.performance.now() - startedAt >= TOP_SCROLL_TIMEOUT_MS) {
          resolve(false)
          return
        }

        window.requestAnimationFrame(tick)
      }

      window.requestAnimationFrame(tick)
    })
  }

  function countFreshItems(beforeKeys: Set<string>) {
    return items.value.filter(item => !beforeKeys.has(feedKey(item))).length
  }

  function notifyRefresh(count: number) {
    if (count > 0) {
      push.success({ message: `已更新 ${count} 条动态` })
      return
    }

    push.info({ message: '暂无新动态' })
  }

  return {
    emptyText,
    itemCount: computed(() => items.value.length),
    loading,
    nextCursor,
    pinnedRows: virtual.pinnedRows,
    sentinel,
    setVirtualRoot: virtual.setRoot,
    setVirtualRow: virtual.setRow,
    showFooterLoading,
    topRefreshOpen,
    topRefreshY,
    virtualRows: virtual.rows,
    virtualStyle: virtual.listStyle,
  }
}
