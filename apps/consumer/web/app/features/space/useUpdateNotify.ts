import { toast } from '@hina-ui/vue'
import type { ApiRequestBody } from '@hikarinagi/api-contract/v3'

export interface UpdateNotifySetting {
  enabled: boolean
  on_progress: boolean
  on_status: boolean
  on_favorite: boolean
  statuses: string[]
}

export function useUpdateNotify(kind: 'manga' | 'novel', initial: UpdateNotifySetting) {
  const setting = ref<UpdateNotifySetting>({ ...initial, statuses: [...initial.statuses] })
  const current = ref<UpdateNotifySetting>({ ...initial, statuses: [...initial.statuses] })
  const saving = ref(false)

  async function save(patch: Partial<UpdateNotifySetting>) {
    if (saving.value) return
    saving.value = true
    try {
      const next =
        kind === 'manga'
          ? await hikariRequest('/api/v3/reader/me/manga/notification', {
              method: 'PATCH',
              body: patch as ApiRequestBody<'/api/v3/reader/me/manga/notification', 'patch'>,
            })
          : await hikariRequest('/api/v3/reader/me/novel/notification', {
              method: 'PATCH',
              body: patch as ApiRequestBody<'/api/v3/reader/me/novel/notification', 'patch'>,
            })
      setting.value = { ...next, statuses: [...next.statuses] }
      current.value = { ...next, statuses: [...next.statuses] }
      toast.success('已更新追更提醒')
    } catch {
      setting.value = { ...current.value, statuses: [...current.value.statuses] }
    } finally {
      saving.value = false
    }
  }

  return { setting, saving, save }
}
