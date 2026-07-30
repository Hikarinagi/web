import type { Ref } from 'vue'
import type { EditorDocument } from '@hikarinagi/editor-schema'
import { mergeEmojiSets } from '~/features/comment/comment'
import type { MediaValue } from '~/components/media-library/types'
import type {
  DmEmojiSet,
  DmMessage,
  DmNewEvent,
  DmReadEvent,
  MessageHistory,
  ThreadMessage,
} from './dm'

interface ThreadHooks {
  onSent: (peerId: number, message: DmMessage) => void
  onRead: (peerId: number) => void
}

interface ThreadCache {
  messages: ThreadMessage[]
  emojiSets: DmEmojiSet[]
  hasMore: boolean
  loaded: boolean
  loading: boolean
}

export function useThread(
  peerId: Ref<number | null>,
  hooks: ThreadHooks,
  seed: { peerId: number; thread: MessageHistory } | null,
) {
  const caches = ref<Record<number, ThreadCache>>({})
  if (seed) {
    caches.value[seed.peerId] = {
      messages: seed.thread.items,
      emojiSets: seed.thread.emoji_sets,
      hasMore: seed.thread.has_more,
      loaded: true,
      loading: false,
    }
  }
  const loadingOlder = ref(false)
  const sending = ref(false)
  const { on } = useRealtime()
  let tempSeq = -1

  function cacheFor(peer: number): ThreadCache {
    const existing = caches.value[peer]
    if (existing) return existing
    caches.value[peer] = {
      messages: [],
      emojiSets: [],
      hasMore: false,
      loaded: false,
      loading: false,
    }
    return caches.value[peer] as ThreadCache
  }
  function absorb(c: ThreadCache, sets: DmEmojiSet[]) {
    if (sets.length) c.emojiSets = mergeEmojiSets(c.emojiSets, sets)
  }

  const active = computed(() => (peerId.value != null ? caches.value[peerId.value] : undefined))
  const messages = computed<ThreadMessage[]>(() => active.value?.messages ?? [])
  const emojiSets = computed<DmEmojiSet[]>(() => active.value?.emojiSets ?? [])
  const hasMore = computed(() => active.value?.hasMore ?? false)
  const pending = computed(() => !!active.value?.loading)

  async function load(peer: number) {
    const c = cacheFor(peer)
    if (c.loaded || c.loading) return
    c.loading = true
    try {
      const res = await hikariRequest('/api/v3/user/me/conversations/{peerId}/messages', {
        path: { peerId: peer },
        query: { limit: 30 },
      })
      c.messages = res.items
      c.hasMore = res.has_more
      c.emojiSets = mergeEmojiSets(c.emojiSets, res.emoji_sets)
      c.loaded = true
    } finally {
      c.loading = false
    }
  }

  async function loadOlder() {
    const peer = peerId.value
    const c = peer != null ? caches.value[peer] : undefined
    if (!c || loadingOlder.value || !c.hasMore || c.messages.length === 0) return
    const oldest = c.messages[0]
    if (!oldest) return
    loadingOlder.value = true
    try {
      const res = await hikariRequest('/api/v3/user/me/conversations/{peerId}/messages', {
        path: { peerId: peer as number },
        query: { limit: 30, before: oldest.id },
      })
      c.messages = [...res.items, ...c.messages]
      c.hasMore = res.has_more
      absorb(c, res.emoji_sets)
    } finally {
      loadingOlder.value = false
    }
  }

  async function send(contentJson: EditorDocument, attachments: MediaValue[], sets: DmEmojiSet[]) {
    const peer = peerId.value
    if (peer == null || sending.value) return
    const c = cacheFor(peer)
    sending.value = true
    absorb(c, sets)
    const temp: ThreadMessage = {
      id: tempSeq--,
      from_me: true,
      content: '',
      content_json: contentJson as unknown as DmMessage['content_json'],
      attachments: attachments.map((m, i) => ({
        order: i,
        media: { id: m.id, src: m.src, width: m.width ?? null, height: m.height ?? null },
      })),
      sent_at: new Date().toISOString(),
      is_read: false,
      read_at: null,
      pending: true,
    }
    c.messages = [...c.messages, temp]
    try {
      const real = await hikariRequest('/api/v3/user/me/conversations/{peerId}/messages', {
        method: 'post',
        path: { peerId: peer },
        body: {
          content_json: contentJson as unknown as Record<string, unknown>,
          attachments: attachments.map((m, i) => ({ media_asset_id: m.id, order: i })),
        },
      })
      c.messages = c.messages.map(m => (m.id === temp.id ? real : m))
      hooks.onSent(peer, real)
    } catch {
      c.messages = c.messages.map(m =>
        m.id === temp.id ? { ...m, pending: false, failed: true } : m,
      )
    } finally {
      sending.value = false
    }
  }

  function retry(message: ThreadMessage) {
    const peer = peerId.value
    const c = peer != null ? caches.value[peer] : undefined
    if (!c) return
    c.messages = c.messages.filter(m => m.id !== message.id)
    const attachments = message.attachments.map(a => ({ ...a.media })) as unknown as MediaValue[]
    void send(message.content_json as unknown as EditorDocument, attachments, [])
  }

  async function markRead(peer: number) {
    await hikariRequest('/api/v3/user/me/conversations/{peerId}/read', {
      method: 'post',
      path: { peerId: peer },
      toast: false,
    }).catch(() => {})
    hooks.onRead(peer)
  }

  const offs: Array<() => void> = []
  onMounted(() => {
    offs.push(
      on<DmNewEvent>('dm:new', ({ message, peer, emoji_sets }) => {
        const c = caches.value[peer.id]
        if (!c || !c.loaded) return
        absorb(c, emoji_sets)
        c.messages = [...c.messages, message]
        if (peer.id === peerId.value) void markRead(peer.id)
      }),
    )
    offs.push(
      on<DmReadEvent>('dm:read', ({ peer_id }) => {
        const c = caches.value[peer_id]
        if (!c) return
        c.messages = c.messages.map(m => (m.from_me ? { ...m, is_read: true } : m))
      }),
    )
  })

  watch(
    peerId,
    p => {
      if (!import.meta.client || p == null) return
      void load(p)
      void markRead(p)
    },
    { immediate: true },
  )

  onBeforeUnmount(() => offs.forEach(off => off()))

  return {
    messages,
    emojiSets,
    pending,
    loadingOlder,
    hasMore,
    sending,
    send,
    retry,
    loadOlder,
    markRead,
  }
}
