import type { ComponentPublicInstance, ComputedRef, Ref } from 'vue'
import { FEED_PAGE_SIZE, type FeedCluster } from './feed'
import { feedClusterHeight, resetFeedHeightCache } from './height'

interface PinnedRow {
  key: string
  cluster: FeedCluster
  index: number
}

interface Row {
  key: string
  cluster: FeedCluster
  index: number
  style: {
    top: string
  }
}

const MIN_VIRTUAL_ITEMS = 24
const OVERSCAN = 900
const DIVIDER_HEIGHT = 1
const FALLBACK_ROW_WIDTH = 600
const FALLBACK_VIEWPORT_WIDTH = 1024
const FALLBACK_VIEWPORT_HEIGHT = 900

export function useFeedVirtualList(
  clusters: ComputedRef<FeedCluster[]>,
  options: { active: Ref<boolean>; cacheKey: string },
) {
  const root = ref<HTMLElement | null>(null)
  const measured = useState<Record<string, number>>(
    `feed:virtual:heights:${options.cacheKey}`,
    () => ({}),
  )
  const rowElements = new Map<string, HTMLElement>()
  const rowKeys = new WeakMap<Element, string>()
  const rowIndexes = new WeakMap<Element, number>()
  const mounted = useMounted()
  const { width } = useElementSize(root)
  const { top } = useElementBounding(root)
  const { height: viewportHeight, width: viewportWidth } = useWindowSize()

  let resizeObserver: ResizeObserver | null = null

  const pinnedCount = computed(() => Math.min(FEED_PAGE_SIZE, clusters.value.length))
  const pinnedRows = computed<PinnedRow[]>(() =>
    clusters.value.slice(0, pinnedCount.value).map((cluster, index) => ({
      key: cluster.key,
      cluster,
      index,
    })),
  )
  const virtualItems = computed(() => clusters.value.slice(pinnedCount.value))
  const shouldClip = computed(() => mounted.value && virtualItems.value.length > MIN_VIRTUAL_ITEMS)
  // v-show 隐藏时元素尺寸全是 0,liveWidths 会塌到 fallback;widths 只在激活时同步,
  // 隐藏期间冻结最后一次真实值,避免高度估算抖动和误清测量缓存。
  const liveWidths = computed(() => ({
    rowWidth: mounted.value ? safeSize(width.value, FALLBACK_ROW_WIDTH) : FALLBACK_ROW_WIDTH,
    viewportWidth: mounted.value
      ? safeSize(viewportWidth.value, FALLBACK_VIEWPORT_WIDTH)
      : FALLBACK_VIEWPORT_WIDTH,
  }))
  const widths = ref(liveWidths.value)

  watch([liveWidths, options.active], () => {
    if (!options.active.value) return
    const next = liveWidths.value
    if (
      next.rowWidth === widths.value.rowWidth &&
      next.viewportWidth === widths.value.viewportWidth
    )
      return
    widths.value = next
    measured.value = {}
  })
  const heightContext = computed(() => ({
    ...widths.value,
    browserMeasure: mounted.value,
  }))
  const heights = computed(() =>
    virtualItems.value.map((cluster, offset) =>
      rowHeight(cluster, pinnedCount.value + offset, heightContext.value),
    ),
  )
  const offsets = computed(() => {
    const out = [0]
    for (const height of heights.value) out.push(out[out.length - 1]! + height)
    return out
  })
  const totalHeight = computed(() => offsets.value[offsets.value.length - 1] ?? 0)
  const range = computed(() => {
    const count = virtualItems.value.length
    if (!shouldClip.value) return { first: 0, last: count }
    if (!count) return { first: 0, last: 0 }

    const start = Math.max(0, -top.value - OVERSCAN)
    const end = Math.min(
      totalHeight.value,
      -top.value + safeSize(viewportHeight.value, FALLBACK_VIEWPORT_HEIGHT) + OVERSCAN,
    )
    const first = findFirst(offsets.value, start)
    const last = Math.max(first + 1, findLast(offsets.value, end))

    return {
      first: Math.max(0, first),
      last: Math.min(count, last),
    }
  })
  const windowRows = computed<Row[]>(() =>
    virtualItems.value.slice(range.value.first, range.value.last).map((cluster, offset) => {
      const tailIndex = range.value.first + offset
      const index = pinnedCount.value + tailIndex
      return {
        key: cluster.key,
        cluster,
        index,
        style: {
          top: `${offsets.value[tailIndex]}px`,
        },
      }
    }),
  )
  const listStyle = computed(() => ({ height: `${totalHeight.value}px` }))

  onMounted(() => {
    resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        const key = rowKeys.get(entry.target)
        const index = rowIndexes.get(entry.target)
        if (!key || index === undefined) continue

        measureRow(key, index, entry.target)
      }
    })

    for (const element of rowElements.values()) resizeObserver.observe(element)
    void document.fonts?.ready.then(() => {
      resetFeedHeightCache()
    })
  })

  onBeforeUnmount(() => {
    resizeObserver?.disconnect()
    resizeObserver = null
  })

  watch(clusters, next => {
    const keys = new Set(next.map(cluster => measureKey(cluster.key, widths.value)))
    const kept: Record<string, number> = {}
    for (const [key, height] of Object.entries(measured.value)) {
      if (keys.has(key)) kept[key] = height
    }
    measured.value = kept
  })

  function setRow(key: string, index: number, value: Element | ComponentPublicInstance | null) {
    const element = value instanceof HTMLElement ? value : null
    const previous = rowElements.get(key)
    if (previous === element) {
      if (element) {
        rowIndexes.set(element, index)
        measureRow(key, index, element)
      }
      return
    }

    if (previous) {
      resizeObserver?.unobserve(previous)
      rowKeys.delete(previous)
      rowIndexes.delete(previous)
    }
    rowElements.delete(key)

    if (!element) return

    rowElements.set(key, element)
    rowKeys.set(element, key)
    rowIndexes.set(element, index)
    resizeObserver?.observe(element)
    measureRow(key, index, element)
  }

  function setRoot(value: Element | ComponentPublicInstance | null) {
    root.value = value instanceof HTMLElement ? value : null
  }

  function rowHeight(
    cluster: FeedCluster,
    index: number,
    ctx: { rowWidth: number; viewportWidth: number; browserMeasure?: boolean },
  ) {
    const measuredHeight = measured.value[measureKey(cluster.key, ctx)]
    const contentHeight = measuredHeight ?? feedClusterHeight(cluster, ctx)
    return contentHeight + (index > 0 ? DIVIDER_HEIGHT : 0)
  }

  function measureRow(key: string, index: number, element: Element) {
    const content = element.firstElementChild
    if (!(content instanceof HTMLElement)) return

    const cluster = clusters.value[index]
    if (!cluster) return

    const next = Math.ceil(content.getBoundingClientRect().height)
    if (next <= 0) return

    const keyForSize = measureKey(key, widths.value)
    const oldContent = measured.value[keyForSize] ?? feedClusterHeight(cluster, heightContext.value)
    const divider = index > 0 ? DIVIDER_HEIGHT : 0
    const oldHeight = oldContent + divider
    const nextHeight = next + divider
    const delta = nextHeight - oldHeight
    const tailIndex = index - pinnedCount.value
    const rowBottom = offsets.value[tailIndex + 1] ?? 0
    const viewportStart = Math.max(0, -top.value)

    measured.value[keyForSize] = next

    if (shouldClip.value && mounted.value && Math.abs(delta) >= 1 && rowBottom <= viewportStart) {
      window.scrollBy(0, delta)
    }
  }

  return {
    listStyle,
    pinnedRows,
    rows: windowRows,
    setRoot,
    setRow,
    totalHeight,
  }
}

function safeSize(value: number, fallback: number) {
  return Number.isFinite(value) && value > 0 ? Math.floor(value) : fallback
}

function measureKey(key: string, ctx: { rowWidth: number; viewportWidth: number }) {
  return `${key}:${ctx.rowWidth}:${ctx.viewportWidth >= 640 ? 'sm' : 'base'}`
}

function findFirst(offsets: number[], value: number) {
  let low = 0
  let high = Math.max(0, offsets.length - 2)

  while (low < high) {
    const mid = Math.floor((low + high) / 2)
    if (offsets[mid + 1]! <= value) low = mid + 1
    else high = mid
  }

  return low
}

function findLast(offsets: number[], value: number) {
  let low = 0
  let high = offsets.length - 1

  while (low < high) {
    const mid = Math.floor((low + high) / 2)
    if (offsets[mid]! < value) low = mid + 1
    else high = mid
  }

  return low
}
