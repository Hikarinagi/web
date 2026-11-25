export async function useHistoryPage<TData>(path: string) {
  const route = useRoute()
  const page = ref(Number(route.query.page) || 1)
  watch(
    () => route.query.page,
    raw => {
      const next = Number(Array.isArray(raw) ? raw[0] : raw) || 1
      if (page.value !== next) page.value = next
    },
  )
  const { data, pending } = await useHikariApiData<TData>(
    () => `/api/pages/${path}/revisions?page=${page.value}` as const,
    { fatal: true },
  )
  return { data, page, pending }
}
