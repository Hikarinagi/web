<script setup lang="ts">
  import { Pagination } from '@hina-ui/vue'
  import type { ComponentPublicInstance } from 'vue'
  import { clampPage, totalPagesFor } from './paginator/pages'
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
  defineOptions({ name: 'HikariPaginator' })
  const props = withDefaults(
    defineProps<{
      meta: PageMeta
      loading?: boolean
      disabled?: boolean
      hideSinglePage?: boolean
      align?: Align
      siblingCount?: number
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
  const currentRoute = useRoute()
  const router = useRouter()
  const nuxtApp = useNuxtApp()
  const root = useTemplateRef<ComponentPublicInstance>('root')
  const rootEl = computed(() => {
    const el = unrefElement(root)
    return el instanceof HTMLElement ? el : null
  })
  const scrolling = ref(false)
  const targetCursor = shallowRef<PaginatorCursor | null>(null)
  let syncingRoute = false
  const { currentPage, currentPageSize, totalPages, setModel } = usePaginatorModel(
    () => props.meta,
    page,
    pageSize,
  )
  const visible = computed(
    () => !props.hideSinglePage || totalPages.value > 1 || props.showPageSize,
  )
  const busy = computed(() => props.disabled || props.loading || scrolling.value)
  const sizeOptions = computed(() => (props.showPageSize ? props.pageSizeOptions : undefined))
  const uiPage = computed({
    get: () => currentPage.value,
    set: value => void go(value),
  })
  const uiPageSize = computed({
    get: () => currentPageSize.value,
    set: value => void go(1, value),
  })

  watch(
    () => [props.meta.page, props.meta.page_size] as const,
    async ([nextPage, nextPageSize]) => {
      const target = targetCursor.value
      if (!target || nextPage !== target.page || nextPageSize !== target.page_size) return

      targetCursor.value = null
      await nextTick()
      if (canScroll())
        await scrollPageTop(rootEl.value, props.scrollTarget, props.scrollOffset, 'auto')
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
      ? scrollPageTop(rootEl.value, props.scrollTarget, props.scrollOffset, props.scrollBehavior)
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
  function canScroll() {
    return props.scrollToTop && props.scrollTarget !== false && props.scrollTarget !== null
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
  <Pagination
    v-if="visible"
    ref="root"
    v-model="uiPage"
    v-model:page-size="uiPageSize"
    :total="meta.total_items"
    :item-count="meta.item_count"
    :sibling-count="siblingCount"
    :show-edges="showEdges"
    :show-first-last="showEdges"
    :show-info="showInfo"
    :show-jump="showJump"
    :page-size-options="sizeOptions"
    :align="align"
    :disabled="busy"
    label="分页导航"
    class="[overflow-anchor:none]"
  />
</template>
