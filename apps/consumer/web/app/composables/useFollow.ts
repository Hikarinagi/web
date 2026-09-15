export function useFollow(userId: number, initial: boolean) {
  const following = useState(`follow:${userId}`, () => initial)
  const pending = ref(false)
  const confirmOpen = ref(false)

  async function apply(next: boolean) {
    pending.value = true
    try {
      await hikariRequest('/api/v3/user/{id}/follow', {
        method: next ? 'PUT' : 'DELETE',
        path: { id: userId },
      })
      following.value = next
    } catch {
      /* empty */
    } finally {
      pending.value = false
    }
  }

  function toggle() {
    if (pending.value) return
    if (following.value) confirmOpen.value = true
    else void apply(true)
  }

  return { following, pending, confirmOpen, toggle, unfollow: () => apply(false) }
}
