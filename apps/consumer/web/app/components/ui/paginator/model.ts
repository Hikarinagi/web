import { computed, getCurrentInstance, ref, watch, type Ref } from 'vue'
import type { PageMeta } from './types'
import { clampPage, totalPagesOf } from './pages'

export function usePaginatorModel(
  meta: () => PageMeta,
  page: Ref<number | undefined>,
  pageSize: Ref<number | undefined>,
) {
  const instance = getCurrentInstance()
  const localPage = ref(meta().page)
  const localPageSize = ref(meta().page_size)
  const hasPageModel = hasProp(instance?.vnode.props, 'page', 'onUpdate:page')
  const hasPageSizeModel = hasProp(
    instance?.vnode.props,
    'pageSize',
    'page-size',
    'onUpdate:pageSize',
  )

  const currentPageSize = computed(() => {
    return hasPageSizeModel ? (pageSize.value ?? meta().page_size) : localPageSize.value
  })
  const totalPages = computed(() => totalPagesOf(meta(), currentPageSize.value))
  const currentPage = computed(() => {
    const value = hasPageModel ? (page.value ?? meta().page) : localPage.value
    return clampPage(value, totalPages.value)
  })

  watch(
    () => meta().page,
    nextPage => {
      localPage.value = nextPage
    },
  )

  watch(
    () => meta().page_size,
    nextPageSize => {
      localPageSize.value = nextPageSize
    },
  )

  function setModel(nextPage: number, nextPageSize: number) {
    if (hasPageModel) page.value = nextPage
    else localPage.value = nextPage

    if (hasPageSizeModel) pageSize.value = nextPageSize
    else localPageSize.value = nextPageSize
  }

  return { currentPage, currentPageSize, totalPages, setModel }
}

function hasProp(props: Record<string, unknown> | null | undefined, ...keys: string[]) {
  return keys.some(key => Object.prototype.hasOwnProperty.call(props, key))
}
