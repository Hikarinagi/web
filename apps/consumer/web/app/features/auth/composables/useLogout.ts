type LogoutScope = 'global' | 'local'

const visible = ref(false)
const pendingScope = ref<LogoutScope | null>(null)
const pending = computed(() => pendingScope.value !== null)

export function useLogout() {
  const auth = useAuthStore()

  function open() {
    if (pending.value) return
    visible.value = true
  }

  function close() {
    if (pending.value) return
    visible.value = false
  }

  async function submit(scope: LogoutScope) {
    if (pending.value) return
    pendingScope.value = scope

    let result: { redirect?: string } | null = null
    try {
      result = await $fetch<{ redirect?: string } | null>('/auth/logout', {
        method: 'POST',
        body: { scope },
      })
    } catch {
      /* empty */
    }

    auth.setUser(null)

    if (result?.redirect) {
      window.location.assign(result.redirect)
      return
    }

    visible.value = false
    pendingScope.value = null
    await navigateTo('/')
  }

  return { visible, pending, pendingScope, open, close, submit }
}
