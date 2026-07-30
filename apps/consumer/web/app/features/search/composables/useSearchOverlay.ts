const QUERY_KEY = 'qsearch'
const QUERY_VALUE = '1'

export function useSearchOverlay() {
  const route = useRoute()
  const router = useRouter()

  const open = computed(() => route.query[QUERY_KEY] === QUERY_VALUE)
  const pushed = useState('search:overlay:pushed', () => false)

  function show() {
    if (open.value) return
    pushed.value = true
    void router.push({ query: { ...route.query, [QUERY_KEY]: QUERY_VALUE } })
  }

  function close() {
    if (!open.value) return
    if (pushed.value) {
      pushed.value = false
      router.back()
      return
    }
    const query = Object.fromEntries(
      Object.entries(route.query).filter(([key]) => key !== QUERY_KEY),
    )
    void router.replace({ query })
  }

  return { open, show, close }
}
