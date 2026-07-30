export function useFollow(userId: number, initial: boolean) {
  const following = useState(`follow:${userId}`, () => initial)
  const pending = ref(false)
  const confirm = useConfirm()

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
    if (!following.value) {
      void apply(true)
      return
    }
    confirm.require({
      group: 'app-shell',
      header: '取消关注',
      message: '取消关注后,TA 的更新将不再出现在你的关注流里。',
      acceptLabel: '取消关注',
      rejectLabel: '再想想',
      onAccept: ({ close }) => {
        close()
        void apply(false)
      },
    })
  }

  return { following, pending, toggle }
}
