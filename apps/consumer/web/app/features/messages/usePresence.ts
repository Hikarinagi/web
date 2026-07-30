import type { Ref } from 'vue'

export function usePresence(peerId: Ref<number | null>) {
  const online = ref(false)
  const { on, emit, connected } = useRealtime()
  let watched: number | null = null

  const off = on<{ user_id: number; online: boolean }>('presence:update', payload => {
    if (payload.user_id === peerId.value) online.value = payload.online
  })

  watch(
    [peerId, connected],
    ([id, conn]) => {
      if (watched != null && watched !== id) emit('presence:unwatch', watched)
      if (!conn || id == null) {
        watched = null
        online.value = false
        return
      }
      if (watched !== id) {
        online.value = false
        emit('presence:watch', id)
      }
      watched = id
    },
    { immediate: true },
  )

  onBeforeUnmount(() => {
    off()
    if (watched != null) emit('presence:unwatch', watched)
  })

  return { online }
}
