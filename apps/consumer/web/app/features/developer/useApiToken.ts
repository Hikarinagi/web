import { normalizeToken } from '~/features/developer/schemas/playground.schema'

const STORAGE_KEY = 'hikari:developer:playground-token'
const SOURCE_KEY = 'hikari:developer:playground-token-source'

export function useApiToken() {
  const token = useState('developer:api-token', () => '')
  const source = useState('developer:api-token-source', () => '')
  const ready = useState('developer:api-token-ready', () => false)

  onMounted(() => {
    if (ready.value) return
    try {
      token.value = normalizeToken(sessionStorage.getItem(STORAGE_KEY) ?? '')
      source.value = sessionStorage.getItem(SOURCE_KEY) ?? ''
    } catch {
      /* empty */
    }
    ready.value = true
  })

  function save(value: string, from = '') {
    token.value = normalizeToken(value)
    source.value = token.value ? from : ''
    try {
      if (!token.value) {
        sessionStorage.removeItem(STORAGE_KEY)
        sessionStorage.removeItem(SOURCE_KEY)
        return
      }
      sessionStorage.setItem(STORAGE_KEY, token.value)
      sessionStorage.setItem(SOURCE_KEY, source.value)
    } catch {
      /* empty */
    }
  }

  function clear() {
    save('')
  }

  const configured = computed(() => Boolean(token.value))
  const preview = computed(() =>
    token.value.length > 12 ? `${token.value.slice(0, 6)}……${token.value.slice(-4)}` : token.value,
  )

  return { token, source, configured, preview, save, clear }
}
