import type { ApiData } from '@hikarinagi/api-contract/v3'

export type MyEmojiSet = ApiData<'/api/v3/emoji/my-sets', 'get'>[number]

export function useMySets() {
  const { data, refresh, status } = useHikariApiData('/api/v3/emoji/my-sets', { toast: false })
  const sets = computed<MyEmojiSet[]>(() => data.value ?? [])
  const loaded = computed(() => status.value === 'success')

  function replace(updated: MyEmojiSet) {
    if (!data.value) return
    data.value = data.value.map(s => (s.id === updated.id ? updated : s))
  }

  function prepend(set: MyEmojiSet) {
    data.value = data.value ? [set, ...data.value] : [set]
  }

  function remove(id: number) {
    if (!data.value) return
    data.value = data.value.filter(s => s.id !== id)
  }

  return { sets, loaded, refresh, replace, prepend, remove }
}
