interface PagedRaw {
  items: readonly unknown[]
  meta: { page: number; total_pages: number; total_items: number }
}

export function useEntityRelation(initial: PagedRaw, loader: (page: number) => Promise<PagedRaw>) {
  const items = ref<unknown[]>([...initial.items])
  const page = ref(initial.meta.page)
  const totalPages = ref(initial.meta.total_pages)
  const total = ref(initial.meta.total_items)
  const pending = ref(false)

  const hasMore = computed(() => page.value < totalPages.value)

  async function loadMore() {
    if (pending.value || !hasMore.value) return
    pending.value = true
    try {
      const res = await loader(page.value + 1)
      items.value = [...items.value, ...res.items]
      page.value = res.meta.page
      totalPages.value = res.meta.total_pages
      total.value = res.meta.total_items
    } finally {
      pending.value = false
    }
  }

  return { items, total, pending, hasMore, loadMore }
}
