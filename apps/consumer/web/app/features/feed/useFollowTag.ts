export function useFollowTag(kind: 'topic' | 'section', id: number, initial: boolean) {
  const following = useState(`follow:${kind}:${id}`, () => initial)
  const pending = ref(false)
  const confirm = useConfirm()

  async function apply(next: boolean) {
    pending.value = true
    try {
      if (kind === 'topic') {
        await hikariRequest('/api/v3/topics/{id}/follow', {
          method: next ? 'PUT' : 'DELETE',
          path: { id },
        })
      } else {
        await hikariRequest('/api/v3/sections/{id}/follow', {
          method: next ? 'PUT' : 'DELETE',
          path: { id },
        })
      }
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
      message: `取消关注后，该${kind === 'topic' ? '话题' : '板块'}的更新将不再进入你的关注流。`,
      acceptLabel: '取消关注',
      rejectLabel: '再想想',
      onAccept: ({ close }: { close: () => void }) => {
        close()
        void apply(false)
      },
    })
  }

  return { following, pending, toggle }
}
