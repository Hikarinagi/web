import type { ApiData } from '@hikarinagi/api-contract/v3'

export type MyEmojiSubscription = ApiData<'/api/v3/emoji/my-subscriptions', 'get'>[number]

export function useMySubscriptions() {
  const { data, refresh, status } = useHikariApiData('/api/v3/emoji/my-subscriptions', {
    toast: false,
  })
  const subscriptions = computed<MyEmojiSubscription[]>(() => data.value ?? [])
  const loaded = computed(() => status.value === 'success')

  function remove(id: number) {
    if (!data.value) return
    data.value = data.value.filter(s => s.id !== id)
  }

  return { subscriptions, loaded, refresh, remove }
}
