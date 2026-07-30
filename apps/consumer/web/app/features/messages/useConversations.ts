import type { Ref } from 'vue'
import { messageExcerpt } from './dm'
import type { Conversation, DmMessage, DmNewEvent } from './dm'

export function useConversations(activePeerId: Ref<number | null>, seed: Conversation[]) {
  const items = ref<Conversation[]>(seed)
  const { on } = useRealtime()

  function applyIncoming({ message, peer }: DmNewEvent) {
    const list = [...items.value]
    const idx = list.findIndex(c => c.peer.id === peer.id)
    const isActive = activePeerId.value === peer.id
    const last = { excerpt: messageExcerpt(message), sent_at: message.sent_at, from_me: false }
    const existing = idx >= 0 ? list.splice(idx, 1)[0] : undefined
    if (existing) {
      list.unshift({
        ...existing,
        last_message: last,
        unread_count: isActive ? existing.unread_count : existing.unread_count + 1,
      })
    } else {
      list.unshift({ peer, last_message: last, unread_count: isActive ? 0 : 1, is_pinned: false })
    }
    items.value = list
  }

  function applyOutgoing(peerId: number, message: DmMessage) {
    const list = [...items.value]
    const idx = list.findIndex(c => c.peer.id === peerId)
    if (idx < 0) return
    const conv = list.splice(idx, 1)[0]
    if (!conv) return
    list.unshift({
      ...conv,
      last_message: { excerpt: messageExcerpt(message), sent_at: message.sent_at, from_me: true },
    })
    items.value = list
  }

  function markPeerRead(peerId: number) {
    items.value = items.value.map(c => (c.peer.id === peerId ? { ...c, unread_count: 0 } : c))
  }

  let off: (() => void) | null = null
  onMounted(() => {
    off = on<DmNewEvent>('dm:new', applyIncoming)
  })
  onBeforeUnmount(() => off?.())

  return { items, applyOutgoing, markPeerRead }
}
