import type { ApiData } from '@hikarinagi/api-contract/v3'

type SearchedVolume = ApiData<'/api/v3/light-novel-volumes', 'get'>['items'][number]

export function useVolumeSearch() {
  const search = ref('')
  const results = shallowRef<SearchedVolume[]>([])
  const loading = ref(false)
  let revision = 0

  watch(search, value => {
    revision++
    results.value = []
    loading.value = !!value.trim()
  })
  watchDebounced(
    search,
    async value => {
      const current = revision
      const keyword = value.trim()
      if (!keyword) return
      const data = await hikariRequest('/api/v3/light-novel-volumes', {
        query: { search: keyword, page: 1, page_size: 20 },
        toast: false,
      }).catch(() => null)
      if (current !== revision) return
      results.value = data?.items ?? []
      loading.value = false
    },
    { debounce: 300 },
  )

  return { search, results, loading }
}
