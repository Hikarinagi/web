import { push } from 'notivue'

export function useOtomeGate(initial: boolean) {
  const auth = useAuthStore()
  const enabled = ref(initial)
  const current = ref(initial)
  const saving = ref(false)

  async function save(value: boolean) {
    if (saving.value || value === current.value) return
    saving.value = true
    try {
      await hikariRequest<'/api/v3/user/me/settings', 'patch'>('/api/v3/user/me/settings', {
        method: 'PATCH',
        body: { hide_otome: value },
      })
      const user = await hikariRequest('/api/v3/user/me', { toast: false })
      auth.setUser(user)
      current.value = value
      push.success({ message: '已更新内容偏好' })
    } catch {
      enabled.value = current.value
    } finally {
      saving.value = false
    }
  }

  return { enabled, saving, save }
}
