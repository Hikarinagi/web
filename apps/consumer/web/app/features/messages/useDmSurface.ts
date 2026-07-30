import type { ComputedRef, InjectionKey, Ref } from 'vue'
import type { DmPageData } from '~~/server/api/pages/dm.get'
import { useConversations } from './useConversations'
import { useThread } from './useThread'
import type { Conversation, DmPeer } from './dm'

export interface DmSurface {
  selectedPeerId: ComputedRef<number | null>
  selectedPeer: Ref<DmPeer | null>
  items: Ref<Conversation[]>
  thread: ReturnType<typeof useThread>
  drilled: ComputedRef<boolean>
  open: (peer: DmPeer) => void
  back: () => void
}

const KEY: InjectionKey<DmSurface> = Symbol('dm-surface')

export function provideDmSurface(initial: DmPageData | null): DmSurface {
  const route = useRoute()
  const router = useRouter()

  const selectedPeerId = computed<number | null>(() => {
    const id = Number(route.query.peer)
    return Number.isInteger(id) && id > 0 ? id : null
  })
  const selectedPeer = ref<DmPeer | null>(null)

  const drilled = computed(
    () => selectedPeerId.value != null || route.query.view === 'notification',
  )

  const conversations = useConversations(selectedPeerId, initial?.conversations.items ?? [])
  const seed =
    initial && initial.peerId != null && initial.thread
      ? { peerId: initial.peerId, thread: initial.thread }
      : null
  const thread = useThread(
    selectedPeerId,
    { onSent: conversations.applyOutgoing, onRead: conversations.markPeerRead },
    seed,
  )

  function open(peer: DmPeer) {
    selectedPeer.value = peer
    void router.replace({ query: { peer: peer.id } })
  }
  function back() {
    selectedPeer.value = null
    void router.replace({ query: {} })
  }

  watch(
    [selectedPeerId, conversations.items],
    async () => {
      const id = selectedPeerId.value
      if (id == null) {
        selectedPeer.value = null
        return
      }
      if (selectedPeer.value?.id === id) return
      const found = conversations.items.value.find(c => c.peer.id === id)
      if (found) {
        selectedPeer.value = found.peer
        return
      }
      const user = await hikariRequest('/api/v3/user/{id}', { path: { id }, toast: false }).catch(
        () => null,
      )
      if (user && selectedPeerId.value === id) {
        selectedPeer.value = {
          id: user.id,
          name: user.name,
          nickname: user.nickname,
          avatar: user.avatar,
          role: user.role,
          equipped_frame: user.equipped_frame,
          equipped_badges: user.equipped_badges,
        }
      }
    },
    { immediate: true },
  )

  const surface: DmSurface = {
    selectedPeerId,
    selectedPeer,
    items: conversations.items,
    thread,
    drilled,
    open,
    back,
  }
  provide(KEY, surface)
  return surface
}

export function useDmSurface(): DmSurface {
  const surface = inject(KEY)
  if (!surface) throw new Error('useDmSurface() must be called under the messages layout')
  return surface
}
