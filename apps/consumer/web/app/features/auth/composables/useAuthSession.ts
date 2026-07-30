export function useAuthSession() {
  const auth = useAuthStore()

  async function ensureLoaded() {
    if (auth.loaded) return

    if (auth.loading) {
      await new Promise<void>(resolve => {
        const stop = watch(
          () => auth.loading,
          loading => {
            if (loading) return
            stop()
            resolve()
          },
          { immediate: true },
        )
      })
      if (auth.loaded) return
    }

    auth.setLoading(true)

    try {
      const user = await hikariRequest('/api/v3/user/me', { toast: false })
      auth.setUser(user)
    } catch {
      auth.setUser(null)
    } finally {
      auth.setLoading(false)
    }
  }

  return { ensureLoaded }
}
