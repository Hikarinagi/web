import { push } from 'notivue'
import type { NotificationPageData } from '~~/server/api/pages/setting/notification.get'

type MangaNotifySetting = NotificationPageData['manga']
type MangaNotifyPatch = Partial<MangaNotifySetting>

export function useMangaNotify(initial: MangaNotifySetting) {
  const setting = ref<MangaNotifySetting>({ ...initial, statuses: [...initial.statuses] })
  const current = ref<MangaNotifySetting>({ ...initial, statuses: [...initial.statuses] })
  const saving = ref(false)

  async function save(patch: MangaNotifyPatch) {
    if (saving.value) return
    saving.value = true
    try {
      const next = await hikariRequest<'/api/v3/reader/me/manga/notification', 'patch'>(
        '/api/v3/reader/me/manga/notification',
        { method: 'PATCH', body: patch },
      )
      setting.value = { ...next, statuses: [...next.statuses] }
      current.value = { ...next, statuses: [...next.statuses] }
      push.success({ message: '已更新追更提醒' })
    } catch {
      setting.value = { ...current.value, statuses: [...current.value.statuses] }
    } finally {
      saving.value = false
    }
  }

  return { setting, saving, save }
}
