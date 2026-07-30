import type { LightNovelRate, LightNovelRateStatus, UpsertLightNovelRateBody } from './rate'

export function useLightNovelRate(lightNovelId: number, initial: LightNovelRate | null) {
  const rate = ref<LightNovelRate | null>(initial)
  const pending = ref(false)
  const status = computed(() => rate.value?.status ?? null)
  const score = computed(() => rate.value?.rate ?? null)

  async function upsert(body: UpsertLightNovelRateBody) {
    if (pending.value) return rate.value
    pending.value = true
    try {
      rate.value = await hikariRequest<'/api/v3/light-novels/{id}/rate', 'put'>(
        '/api/v3/light-novels/{id}/rate',
        { method: 'put', path: { id: lightNovelId }, body },
      )
    } finally {
      pending.value = false
    }
    return rate.value
  }

  function setStatus(next: LightNovelRateStatus) {
    return upsert({ status: next })
  }

  function clearStatus() {
    return upsert({ status: null })
  }

  async function remove() {
    if (pending.value) return
    pending.value = true
    try {
      await hikariRequest<'/api/v3/light-novels/{id}/rate', 'delete'>(
        '/api/v3/light-novels/{id}/rate',
        { method: 'delete', path: { id: lightNovelId } },
      )
      rate.value = null
    } finally {
      pending.value = false
    }
  }

  return { rate, status, score, pending, upsert, setStatus, clearStatus, remove }
}
