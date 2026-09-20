<script setup lang="ts">
  import type { ClassValue } from 'clsx'
  import PaginatorControls from './paginator/Controls.vue'
  import PaginatorList from './paginator/List.vue'
  import { clampPage, pageTokens, totalPagesFor } from './paginator/pages'
  import { usePaginatorModel } from './paginator/model'
  import { pageRouteEquals, readPageRoute, updatePageRoute } from './paginator/route'
  import { scrollPageTop, type PaginatorScrollTarget } from './paginator/scroll'
  import type {
    PageMeta,
    PaginatorChangePayload,
    PaginatorCursor,
    PaginatorRouteMode,
  } from './paginator/types'

  type Align = 'start' | 'center' | 'end' | 'between'
  defineOptions({ name: 'HikariPaginator', inheritAttrs: false })
  const props = withDefaults(
    defineProps<{
      meta: PageMeta
      loading?: boolean
      disabled?: boolean
      hideSinglePage?: boolean
      align?: Align
      siblingCount?: number
      boundaryCount?: number
      showEdges?: boolean
      showInfo?: boolean
      showPageSize?: boolean
      showJump?: boolean
      pageSizeOptions?: number[]
      route?: PaginatorRouteMode
      pageParam?: string
      pageSizeParam?: string
      omitFirstPage?: boolean
      scrollToTop?: boolean
      scrollTarget?: PaginatorScrollTarget
      scrollBehavior?: ScrollBehavior
      scrollOffset?: number | null
    }>(),
    {
      align: 'end',
      boundaryCount: 1,
      hideSinglePage: true,
      omitFirstPage: true,
      pageParam: 'page',
      pageSizeOptions: () => [10, 20, 30, 50],
      pageSizeParam: 'page_size',
      route: false,
      scrollOffset: null,
      scrollBehavior: 'smooth',
      scrollToTop: true,
      scrollTarget: 'auto',
      showEdges: true,
      showInfo: true,
      siblingCount: 1,
    },
  )

  const page = defineModel<number>('page')
  const pageSize = defineModel<number>('pageSize')
  const emit = defineEmits<{ change: [payload: PaginatorChangePayload] }>()
  const attrs = useAttrs()
  const currentRoute = useRoute()
  const router = useRouter()
  const nuxtApp = useNuxtApp()
  const root = useTemplateRef<HTMLElement>('root')
  const scrolling = ref(false)
  const targetCursor = shallowRef<PaginatorCursor | null>(null)
  let syncingRoute = false
  const { currentPage, currentPageSize, totalPages, setModel } = usePaginatorModel(
    () => props.meta,
    page,
    pageSize,
  )
  const tokens = computed(() =>
    pageTokens(currentPage.value, totalPages.value, props.siblingCount, props.boundaryCount),
  )
  const visible = computed(
    () => !props.hideSinglePage || totalPages.value > 1 || props.showPageSize,
  )
  const busy = computed(() => props.disabled || props.loading || scrolling.value)
  const rangeText = computed(() => {
    if (!props.meta.total_items) return '0 条'
    const start = (currentPage.value - 1) * currentPageSize.value + 1
    const count = props.meta.item_count ?? props.meta.page_size
    const end = Math.min(props.meta.total_items, start + count - 1)
    return `${start}-${end} / ${props.meta.total_items} 条`
  })
  const infoWidth = computed(() => {
    const totalDigits = digits(props.meta.total_items)
    const pageDigits = digits(totalPages.value)
    return `${Math.max(18, totalDigits * 3 + pageDigits * 2 + 12)}ch`
  })
  const infoStyle = computed(() => ({ '--hikari-paginator-info-width': infoWidth.value }))
  const pageSizeItems = computed(() => {
    const options = new Set([...props.pageSizeOptions, props.meta.page_size])
    return [...options]
      .filter(n => Number.isFinite(n) && n > 0)
      .sort((a, b) => a - b)
      .map(value => ({ label: `${value} / 页`, value }))
  })
  const jumpPage = ref<number | null>(currentPage.value)
  const rootClass = computed(() =>
    cn(
      'flex w-full flex-col items-center gap-3 text-sm text-muted-color [overflow-anchor:none] sm:flex-row sm:flex-wrap',
      props.align === 'start' && 'sm:justify-start',
      props.align === 'center' && 'sm:justify-center',
      props.align === 'end' && 'sm:justify-end',
      props.align === 'between' && 'sm:justify-between',
      attrs.class as ClassValue,
    ),
  )

  watch(currentPage, nextPage => {
    jumpPage.value = nextPage
  })

  watch(
    () => [props.meta.page, props.meta.page_size] as const,
    async ([nextPage, nextPageSize]) => {
      const target = targetCursor.value
      if (!target || nextPage !== target.page || nextPageSize !== target.page_size) return

      targetCursor.value = null
      await nextTick()
      if (canScroll())
        await scrollPageTop(root.value, props.scrollTarget, props.scrollOffset, 'auto')
    },
  )

  watch(
    () => [props.meta.page, props.meta.page_size] as const,
    ([nextPage, nextPageSize]) => {
      void syncRoute(nextPage, nextPageSize)
    },
  )

  watch(
    [() => currentRoute.query[props.pageParam], () => currentRoute.query[props.pageSizeParam]],
    () => applyRouteChange(),
  )
  onMounted(() => applyRouteChange())

  let loadingHeld = false
  function setLoadingBar(active: boolean) {
    if (active === loadingHeld) return
    loadingHeld = active
    void nuxtApp.callHook(active ? 'page:loading:start' : 'page:loading:end')
  }
  watch(
    () => props.loading,
    loading => setLoadingBar(Boolean(loading)),
  )
  onScopeDispose(() => setLoadingBar(false))
  async function go(rawPage: number, rawPageSize = currentPageSize.value) {
    if (busy.value) return

    const nextPageSize = Math.max(1, Math.trunc(rawPageSize))
    const nextTotalPages = totalPagesFor(props.meta.total_items, nextPageSize)
    const nextPage = clampPage(rawPage, nextTotalPages)
    if (nextPage === currentPage.value && nextPageSize === currentPageSize.value) return

    scrolling.value = true
    const ready = canScroll()
      ? scrollPageTop(root.value, props.scrollTarget, props.scrollOffset, props.scrollBehavior)
      : Promise.resolve()
    const payload = { page: nextPage, page_size: nextPageSize, meta: props.meta, ready }
    targetCursor.value = canScroll() ? payload : null
    try {
      if (!props.route) emit('change', payload)
      else {
        setModel(nextPage, nextPageSize)
        void syncRoute(nextPage, nextPageSize)
        emit('change', payload)
      }

      await ready
      if (!props.route) setModel(nextPage, nextPageSize)
    } finally {
      scrolling.value = false
    }
  }
  function changePageSize(value: number) {
    void go(1, value)
  }
  function canScroll() {
    return props.scrollToTop && props.scrollTarget !== false && props.scrollTarget !== null
  }
  function digits(value: number) {
    return String(Math.max(0, Math.trunc(value))).length
  }
  function jump() {
    void go(jumpPage.value ?? currentPage.value)
  }
  function routeOptions() {
    return {
      omitFirstPage: props.omitFirstPage,
      pageParam: props.pageParam,
      pageSizeParam: props.pageSizeParam,
      showPageSize: props.showPageSize,
    }
  }
  async function syncRoute(nextPage: number, nextPageSize: number) {
    if (!props.route || pageRouteEquals(currentRoute, routeOptions(), nextPage, nextPageSize))
      return

    syncingRoute = true
    try {
      await updatePageRoute(
        router,
        currentRoute,
        props.route,
        routeOptions(),
        nextPage,
        nextPageSize,
      )
      await nextTick()
    } finally {
      syncingRoute = false
    }
  }
  function applyRouteChange() {
    if (!props.route || syncingRoute || props.disabled) return

    const routeState = readPageRoute(currentRoute, routeOptions(), currentPageSize.value)
    const nextPageSize = Math.max(1, Math.trunc(routeState.pageSize))
    const nextTotalPages = totalPagesFor(props.meta.total_items, nextPageSize)
    const nextPage = clampPage(routeState.page, nextTotalPages)
    if (nextPage === currentPage.value && nextPageSize === currentPageSize.value) {
      void syncRoute(nextPage, nextPageSize)
      return
    }

    const ready = Promise.resolve()
    const payload = { page: nextPage, page_size: nextPageSize, meta: props.meta, ready }
    setModel(nextPage, nextPageSize)
    emit('change', payload)
  }
</script>

<template>
  <nav v-if="visible" ref="root" :class="rootClass" aria-label="分页导航">
    <div
      v-if="showInfo"
      class="max-w-full shrink-0 text-center text-xs tabular-nums sm:min-w-(--hikari-paginator-info-width) sm:text-left sm:text-sm"
      :style="infoStyle"
    >
      {{ rangeText }}
      <span class="ml-1 text-surface-400">第 {{ currentPage }} / {{ totalPages }} 页</span>
    </div>

    <div class="max-w-full shrink-0 scrollbar-none overflow-x-auto [&::-webkit-scrollbar]:hidden">
      <div class="mx-auto flex w-max items-center gap-2">
        <PaginatorList
          :busy="busy"
          :current-page="currentPage"
          :show-edges="showEdges"
          :tokens="tokens"
          :total-pages="totalPages"
          @page="go"
        />

        <PaginatorControls
          v-if="showPageSize || showJump"
          v-model:jump-page="jumpPage"
          :busy="busy"
          :current-page-size="currentPageSize"
          :page-size-items="pageSizeItems"
          :show-jump="showJump"
          :show-page-size="showPageSize"
          :total-pages="totalPages"
          @jump="jump"
          @page-size="changePageSize"
        />
      </div>
    </div>
  </nav>
</template>
