import type { GalgameRate, GalgameRateStatus, UpsertGalgameRateBody } from './rate'

export function useGalgameRate(galgameId: number, initial: GalgameRate | null) {
  const rate = ref<GalgameRate | null>(initial)
  const pending = ref(false)
  const status = computed(() => rate.value?.status ?? null)
  const statusPrivate = computed(() => rate.value?.status_private ?? false)
  const score = computed(() => rate.value?.rate ?? null)

  async function upsert(body: UpsertGalgameRateBody) {
    if (pending.value) return rate.value
    pending.value = true
    try {
      rate.value = await hikariRequest<'/api/v3/galgames/{id}/rate', 'put'>(
        '/api/v3/galgames/{id}/rate',
        { method: 'put', path: { id: galgameId }, body },
      )
    } finally {
      pending.value = false
    }
    return rate.value
  }

  function setStatus(next: GalgameRateStatus, priv: boolean) {
    return upsert({ status: next, status_private: priv })
  }

  function setPrivacy(value: boolean) {
    return upsert({ status_private: value })
  }

  async function remove() {
    if (pending.value) return
    pending.value = true
    try {
      await hikariRequest<'/api/v3/galgames/{id}/rate', 'delete'>('/api/v3/galgames/{id}/rate', {
        method: 'delete',
        path: { id: galgameId },
      })
      rate.value = null
    } finally {
      pending.value = false
    }
  }

  return {
    rate,
    status,
    statusPrivate,
    score,
    pending,
    upsert,
    setStatus,
    setPrivacy,
    remove,
  }
}
