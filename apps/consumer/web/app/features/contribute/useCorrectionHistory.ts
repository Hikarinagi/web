import type { ApiData } from '@hikarinagi/api-contract/v3'

type Correction = ApiData<'/api/v3/user/me/epub/corrections', 'get'>['items'][number]

const PAGE_SIZE = 20

export function useCorrectionHistory(open: Ref<boolean>) {
  const rows = shallowRef<Correction[]>([])
  const total = ref(0)
  const loading = ref(false)
  let page = 0

  async function load(next: number) {
    loading.value = true
    const data = await hikariRequest('/api/v3/user/me/epub/corrections', {
      query: { page: next, page_size: PAGE_SIZE },
    }).catch(() => null)
    loading.value = false
    if (!data) return
    rows.value = next === 1 ? data.items : [...rows.value, ...data.items]
    total.value = data.meta.total_items
    page = next
  }

  watch(open, value => {
    if (value) load(1)
  })

  return {
    rows,
    loading,
    done: computed(() => rows.value.length >= total.value),
    more: () => load(page + 1),
  }
}
