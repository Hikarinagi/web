import { toast } from '@hina-ui/vue'
import { isApiError } from '~/utils/api/error'

export function useRegionLock() {
  const held = ref<string | null>(null)
  let timer: ReturnType<typeof setTimeout> | null = null

  function schedule(regionId: string, expiresAt: string | null) {
    if (timer) clearTimeout(timer)
    const ttl = expiresAt ? new Date(expiresAt).getTime() - Date.now() : 60_000
    timer = setTimeout(() => void renew(regionId), Math.max(5_000, ttl / 2))
  }

  async function renew(regionId: string) {
    if (held.value !== regionId) return
    try {
      const lock = await hikariRequest('/api/v3/manga-text-regions/{region_id}/lock', {
        method: 'POST',
        path: { region_id: regionId },
        toast: false,
      })
      schedule(regionId, lock.lock_expires_at)
    } catch {
      held.value = null
    }
  }

  async function release() {
    if (timer) clearTimeout(timer)
    timer = null
    const regionId = held.value
    held.value = null
    if (!regionId) return
    await hikariRequest('/api/v3/manga-text-regions/{region_id}/lock', {
      method: 'DELETE',
      path: { region_id: regionId },
      toast: false,
    }).catch(() => {})
  }

  async function acquire(regionId: string): Promise<boolean> {
    if (held.value === regionId) return true
    await release()
    try {
      const lock = await hikariRequest('/api/v3/manga-text-regions/{region_id}/lock', {
        method: 'POST',
        path: { region_id: regionId },
        toast: false,
      })
      held.value = regionId
      schedule(regionId, lock.lock_expires_at)
      return true
    } catch (error) {
      toast.warning(
        isApiError(error) && error.code === 'MANGA_TEXT_REGION_LOCKED'
          ? '此文本框正在由另一位成员编辑'
          : '无法编辑此文本框',
      )
      return false
    }
  }

  onBeforeUnmount(() => void release())

  return { held, acquire, release }
}
