import { push } from 'notivue'
import type { UnreadSummary } from '~/features/notifications/notifications'
import type { DmNewEvent } from '~/features/messages/dm'
import { useUnread } from '~/features/notifications/useUnread'
import { useDmUnread } from '~/features/messages/useDmUnread'

export default defineNuxtPlugin(() => {
  const auth = useAuthStore()
  const router = useRouter()
  const { connect, disconnect, ensureConnected, on } = useRealtime()
  const notifications = useUnread()
  const dmUnread = useDmUnread()

  on<UnreadSummary>('unread:notification', summary => notifications.set(summary))
  on<{ count: number }>('unread:dm', payload => dmUnread.set(payload.count))
  on<DmNewEvent>('dm:new', ({ peer }) => {
    if (router.currentRoute.value.path === '/messages') return
    push.info({ message: `${displayName(peer)} 给你发了一条私信`, props: { kind: 'dm', peer } })
  })

  watch(
    () => auth.isAuthenticated,
    authed => {
      if (authed) {
        connect()
      } else {
        disconnect()
        notifications.set(null)
        dmUnread.set(0)
      }
    },
    { immediate: true },
  )

  const online = useOnline()
  const visibility = useDocumentVisibility()
  watch([online, visibility], ([isOnline, vis]) => {
    if (auth.isAuthenticated && isOnline && vis === 'visible') ensureConnected()
  })
})
