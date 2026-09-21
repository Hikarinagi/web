import type { Form } from '@hina-ui/vue'
import { push } from 'notivue'
import { getFieldErrors } from '~/utils/api/error'

export function useChangeUsernameForm(onSuccess: () => void) {
  const auth = useAuthStore()
  const form = useTemplateRef<InstanceType<typeof Form>>('form')
  const submitting = ref(false)
  const confirmed = ref(false)
  const values = reactive({ username: '' })

  async function submit() {
    if (!confirmed.value || submitting.value) return
    submitting.value = true
    try {
      const updated = await hikariRequest<'/api/v3/user/me/username', 'patch'>(
        '/api/v3/user/me/username',
        { method: 'PATCH', body: { username: values.username.trim() } },
      )
      auth.setUser(updated)
      push.success({ message: '用户名已修改' })
      onSuccess()
    } catch (error) {
      form.value?.setErrors(getFieldErrors(error))
    } finally {
      submitting.value = false
    }
  }

  function reset() {
    form.value?.reset()
    values.username = ''
    confirmed.value = false
  }

  return { form, values, submitting, confirmed, submit, reset }
}
