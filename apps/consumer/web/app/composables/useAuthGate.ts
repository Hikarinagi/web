import type { AuthMode } from '~/types/auth'

export function useAuthGate() {
  const route = useRoute()

  function toLogin(mode: AuthMode = 'login', returnTo?: string) {
    if (!import.meta.client) return
    const form = document.createElement('form')
    form.method = 'POST'
    form.action = '/auth/login'
    const add = (name: string, value: string) => {
      const input = document.createElement('input')
      input.type = 'hidden'
      input.name = name
      input.value = value
      form.appendChild(input)
    }
    add('return_to', returnTo ?? route.fullPath)
    if (mode === 'register') add('view', 'register')
    document.body.appendChild(form)
    form.submit()
  }

  return { toLogin }
}
