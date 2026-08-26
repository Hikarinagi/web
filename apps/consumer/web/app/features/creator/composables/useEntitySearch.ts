import type { components } from '@hikarinagi/api-contract/v3'
import type { BackendEntitySummary } from '~/features/creator/editor'
import { topVotedMedia } from '~/utils/media/image'

export type ProducerType = components['schemas']['ProducerType']

export type EntityTarget =
  | 'tag'
  | 'person'
  | 'producer'
  | 'character'
  | 'galgame'
  | 'light_novel'
  | 'manga'

export async function fetchEntitySearch(
  target: EntityTarget,
  search: string,
  pageSize = 24,
  opts: { scope?: 'editor' | 'public'; producerTypes?: ProducerType[] } = {},
): Promise<BackendEntitySummary[]> {
  const query = { search, page: 1, page_size: pageSize } as const
  if (opts.scope === 'public') {
    switch (target) {
      case 'tag': {
        const res = await hikariRequest('/api/v3/tags', { query })
        return res.items
      }
      case 'producer': {
        const res = await hikariRequest('/api/v3/producers', {
          query: { ...query, types: opts.producerTypes?.length ? opts.producerTypes : undefined },
        })
        return res.items
      }
      case 'person': {
        const res = await hikariRequest('/api/v3/people', { query })
        return res.items
      }
    }
  }
  switch (target) {
    // 实体走 editor-search:包含 PENDING(provisional)供引用 + 打标;公开列表仍只 PUBLISHED。
    case 'tag':
    case 'person':
    case 'producer':
    case 'character': {
      const res = await hikariRequest('/api/v3/entity-search', { query: { ...query, target } })
      return res.items
    }
    case 'galgame': {
      const res = await hikariRequest('/api/v3/galgames', {
        query: { ...query, include_dev: true },
      })
      return res.items.map(g => ({
        id: g.id,
        name: g.trans_title || g.origin_title,
        cover: topVotedMedia(g.covers)?.src ?? null,
        status: 'PUBLISHED' as const,
      }))
    }
    case 'light_novel': {
      const res = await hikariRequest('/api/v3/light-novels', { query })
      return res.items.map(item => ({
        id: item.id,
        name: item.name_cn || item.name,
        cover: topVotedMedia(item.covers)?.src ?? null,
        status: 'PUBLISHED' as const,
      }))
    }
    case 'manga': {
      const res = await hikariRequest('/api/v3/mangas', { query })
      return res.items.map(item => ({
        id: item.id,
        name: item.name_cn || item.name,
        cover: topVotedMedia(item.covers)?.src ?? null,
        status: 'PUBLISHED' as const,
      }))
    }
  }
}

export function useEntitySearch(
  target: () => EntityTarget,
  options: {
    debounceMs?: number
    pageSize?: number
    scope?: 'editor' | 'public'
    producerTypes?: ProducerType[]
  } = {},
) {
  const query = ref('')
  const results = ref<BackendEntitySummary[]>([])
  const loading = ref(false)
  const searched = ref(false)
  let requestSeq = 0
  let skipNextQueryWatch = false

  async function refresh() {
    const seq = ++requestSeq
    loading.value = true
    searched.value = false
    try {
      const rows = await fetchEntitySearch(target(), query.value, options.pageSize, {
        scope: options.scope,
        producerTypes: options.producerTypes,
      })
      if (seq !== requestSeq) return
      results.value = rows
      searched.value = true
    } catch {
      if (seq !== requestSeq) return
      results.value = []
      searched.value = false
    } finally {
      if (seq === requestSeq) loading.value = false
    }
  }

  const debouncedRefresh = useDebounceFn(refresh, options.debounceMs ?? 250)
  watch(query, () => {
    if (skipNextQueryWatch) {
      skipNextQueryWatch = false
      return
    }
    requestSeq += 1
    searched.value = false
    results.value = []
    loading.value = true
    void debouncedRefresh()
  })

  function reset() {
    requestSeq += 1
    if (query.value !== '') skipNextQueryWatch = true
    query.value = ''
    results.value = []
    searched.value = false
    loading.value = false
  }

  return { query, results, loading, searched, refresh, reset }
}
