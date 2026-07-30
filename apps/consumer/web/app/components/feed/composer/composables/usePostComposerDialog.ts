const QUERY_KEY = 'compose'
const QUERY_VALUE = 'post'
const EDIT_KEY = 'edit'

export function usePostComposerDialog() {
  const route = useRoute()
  const router = useRouter()

  const open = computed(() => route.query[QUERY_KEY] === QUERY_VALUE)
  const editId = computed(() => {
    if (route.query[QUERY_KEY] !== QUERY_VALUE) return null
    const raw = route.query[EDIT_KEY]
    const n = Number(Array.isArray(raw) ? raw[0] : raw)
    return Number.isFinite(n) && n > 0 ? n : null
  })
  const submitting = useState('feed:post-composer-dialog:submitting', () => false)
  const pushed = useState('feed:post-composer-dialog:pushed', () => false)

  function show(editPostId?: number) {
    if (open.value) return
    pushed.value = true
    router.push({
      query: {
        ...route.query,
        [QUERY_KEY]: QUERY_VALUE,
        ...(editPostId != null ? { [EDIT_KEY]: String(editPostId) } : {}),
      },
    })
  }

  function close() {
    if (!open.value) return
    if (pushed.value) {
      pushed.value = false
      router.back()
      return
    }
    const query = Object.fromEntries(
      Object.entries(route.query).filter(([key]) => key !== QUERY_KEY && key !== EDIT_KEY),
    )
    router.replace({ query })
  }

  return { open, editId, submitting, show, close }
}
