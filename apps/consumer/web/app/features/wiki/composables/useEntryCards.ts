import type { WikiSearchItem } from '~/features/wiki/entries'

export function useEntryCards(ids: () => number[], types: WikiSearchItem['type'][]) {
  const wanted = () => [...new Set(ids().filter(id => id > 0))].sort((a, b) => a - b)
  const initial = wanted().slice(0, 100)
  const { data } = useHikariApiData('/api/v3/wiki/entries', {
    key: `wiki-cards:${types.join(',')}:${initial.join(',')}`,
    query: { ids: initial, types },
    immediate: initial.length > 0,
    toast: false,
  })
  const later = shallowRef(new Map<number, WikiSearchItem>())
  const asked = new Set(initial)

  watch(
    () => wanted().filter(id => !asked.has(id)),
    async missing => {
      if (!import.meta.client || !missing.length) return
      for (const id of missing) asked.add(id)
      const items = await hikariRequest('/api/v3/wiki/entries', {
        query: { ids: missing.slice(0, 100), types },
        toast: false,
      }).catch(() => [])
      later.value = new Map([...later.value, ...items.map(item => [item.id, item] as const)])
    },
    { immediate: true },
  )

  return computed(
    () => new Map([...(data.value ?? []).map(item => [item.id, item] as const), ...later.value]),
  )
}
