import { push } from 'notivue'
import type { CurrentUser } from '~/types/auth'

type ContentLimit = CurrentUser['content_limit']

export function useContentLimit(initial: ContentLimit) {
  const auth = useAuthStore()
  const selected = ref<ContentLimit>(initial)
  const current = ref<ContentLimit>(initial)
  const saving = ref(false)

  async function save(value: ContentLimit) {
    if (saving.value || value === current.value) return
    saving.value = true
    try {
      await hikariRequest<'/api/v3/user/me/settings', 'patch'>('/api/v3/user/me/settings', {
        method: 'PATCH',
        body: { content_limit: value },
      })
      const user = await hikariRequest('/api/v3/user/me', { toast: false })
      auth.setUser(user)
      current.value = value
      push.success({ message: '已更新内容偏好' })
    } catch {
      selected.value = current.value
    } finally {
      saving.value = false
    }
  }

  return { selected, saving, save }
}
