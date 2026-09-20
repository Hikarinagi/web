import type { FormInstance, FormSubmitEvent } from '@primevue/forms/form'
import { push } from 'notivue'
import { usernameResolver, type UsernameValues } from './schemas/username.schema'

export function useChangeUsernameForm(onSuccess: () => void) {
  const auth = useAuthStore()
  const formErrors = useFormErrors(usernameResolver)
  const form = useTemplateRef<FormInstance>('form')
  const submitting = ref(false)
  const confirmed = ref(false)

  async function submit(event: FormSubmitEvent) {
    if (!event.valid || !confirmed.value || submitting.value) return
    submitting.value = true
    try {
      const values = event.values as UsernameValues
      const updated = await hikariRequest<'/api/v3/user/me/username', 'patch'>(
        '/api/v3/user/me/username',
        { method: 'PATCH', body: { username: values.username } },
      )
      auth.setUser(updated)
      push.success({ message: '用户名已修改' })
      onSuccess()
    } catch (error) {
      await formErrors.apply(error, form.value)
    } finally {
      submitting.value = false
    }
  }

  function reset() {
    form.value?.reset()
    formErrors.clear()
    confirmed.value = false
  }

  return { form, formErrors, submitting, confirmed, submit, reset }
}
