import type { Ref } from 'vue'
import type { GalgameSummary } from './explore'
import { titleOf } from './explore'
import type { GalgameRate, GalgameRateStatus, UpsertGalgameRateBody } from './rate'

type Step = 'search' | 'record' | 'done'

export function useExploreRecordDialog(visible: Ref<boolean>) {
  const step = ref<Step>('search')
  const query = ref('')
  const results = ref<GalgameSummary[]>([])
  const selected = ref<GalgameSummary | null>(null)
  const status = ref<GalgameRateStatus>('COMPLETED')
  const score = ref(8)
  const content = ref('')
  const spoiler = ref(false)
  const searching = ref(false)
  const searched = ref(false)
  const loadingRate = ref(false)
  const saving = ref(false)
  let searchSeq = 0

  const selectedTitle = computed(() => (selected.value ? titleOf(selected.value) : ''))
  const doneRoute = computed(() =>
    selected.value ? `/galgames/${selected.value.id}` : '/galgames',
  )

  const runSearch = useDebounceFn(async () => {
    const text = query.value.trim()
    const seq = ++searchSeq
    if (!text) {
      searching.value = false
      searched.value = false
      results.value = []
      return
    }

    searching.value = true
    searched.value = true
    try {
      const data = await hikariRequest<'/api/v3/galgames'>('/api/v3/galgames', {
        method: 'get',
        toast: false,
        query: {
          page: 1,
          page_size: 6,
          search: text,
          sort_field: 'revised_at',
          sort_order: 'desc',
        },
      })
      if (seq === searchSeq) results.value = data.items
    } catch {
      if (seq === searchSeq) results.value = []
    } finally {
      if (seq === searchSeq) searching.value = false
    }
  }, 260)

  watch(query, value => {
    if (!value.trim()) {
      searchSeq += 1
      searching.value = false
      searched.value = false
      results.value = []
      return
    }
    void runSearch()
  })

  function reset() {
    step.value = 'search'
    query.value = ''
    results.value = []
    selected.value = null
    status.value = 'COMPLETED'
    score.value = 8
    content.value = ''
    spoiler.value = false
    searched.value = false
    searching.value = false
    loadingRate.value = false
    saving.value = false
    searchSeq += 1
  }

  watch(visible, next => {
    if (next) reset()
  })

  async function selectWork(item: GalgameSummary) {
    selected.value = item
    step.value = 'record'
    status.value = 'COMPLETED'
    score.value = 8
    content.value = ''
    spoiler.value = false
    loadingRate.value = true

    try {
      const rate = await hikariRequest<'/api/v3/galgames/{id}/rate'>('/api/v3/galgames/{id}/rate', {
        method: 'get',
        path: { id: item.id },
        toast: false,
      })
      applyRate(rate)
    } catch {
      // No existing record, or the record endpoint is temporarily unavailable.
    } finally {
      loadingRate.value = false
    }
  }

  function applyRate(rate: GalgameRate) {
    status.value = rate.status ?? 'COMPLETED'
    score.value = rate.rate ?? 8
    content.value = rate.rate_content ?? ''
    spoiler.value = rate.is_spoiler
  }

  async function submit() {
    if (!selected.value || saving.value) return

    const body: UpsertGalgameRateBody =
      status.value !== 'PLAN'
        ? {
            status: status.value,
            rate: score.value,
            rate_content: content.value.trim(),
            is_spoiler: spoiler.value,
          }
        : { status: status.value }

    saving.value = true
    try {
      await hikariRequest<'/api/v3/galgames/{id}/rate', 'put'>('/api/v3/galgames/{id}/rate', {
        method: 'put',
        path: { id: selected.value.id },
        body,
      })
      step.value = 'done'
    } finally {
      saving.value = false
    }
  }

  function backToSearch() {
    if (saving.value) return
    step.value = 'search'
  }

  return {
    step,
    query,
    results,
    selected,
    status,
    score,
    content,
    spoiler,
    searching,
    searched,
    loadingRate,
    saving,
    selectedTitle,
    doneRoute,
    selectWork,
    submit,
    backToSearch,
    again: reset,
  }
}
