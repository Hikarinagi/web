import type { LightNovelVolumeRate, UpsertLightNovelVolumeRateBody } from './rate'

export function useLightNovelVolumeRate(volumeId: number, initial: LightNovelVolumeRate | null) {
  const rate = ref<LightNovelVolumeRate | null>(initial)
  const pending = ref(false)
  const score = computed(() => rate.value?.rate ?? null)

  async function upsert(body: UpsertLightNovelVolumeRateBody) {
    if (pending.value) return rate.value
    pending.value = true
    try {
      rate.value = await hikariRequest<'/api/v3/light-novel-volumes/{id}/rate', 'put'>(
        '/api/v3/light-novel-volumes/{id}/rate',
        { method: 'put', path: { id: volumeId }, body },
      )
    } finally {
      pending.value = false
    }
    return rate.value
  }

  async function remove() {
    if (pending.value) return
    pending.value = true
    try {
      await hikariRequest<'/api/v3/light-novel-volumes/{id}/rate', 'delete'>(
        '/api/v3/light-novel-volumes/{id}/rate',
        { method: 'delete', path: { id: volumeId } },
      )
      rate.value = null
    } finally {
      pending.value = false
    }
  }

  return { rate, score, pending, upsert, remove }
}
