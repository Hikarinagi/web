import { io, type Socket } from 'socket.io-client'

let socket: Socket | null = null
let authRetryTimer: ReturnType<typeof setTimeout> | null = null
let authRetries = 0
const listeners = new Map<string, Set<(payload: never) => void>>()

function bindAll(active: Socket): void {
  for (const [event, set] of listeners) {
    for (const fn of set) active.on(event, fn as (payload: unknown) => void)
  }
}

function clearAuthRetry(): void {
  if (authRetryTimer) {
    clearTimeout(authRetryTimer)
    authRetryTimer = null
  }
}

async function refreshSession(): Promise<void> {
  await hikariRequest('/api/v3/user/me', { toast: false }).catch(() => {})
}

export function useRealtime() {
  const connected = useState('realtime:connected', () => false)
  const config = useRuntimeConfig()

  function connect(): void {
    if (!import.meta.client || socket) return
    const base = config.public.wsBase || (import.meta.dev ? 'http://localhost:5003' : '')
    const opts = {
      path: '/ws',
      transports: ['websocket'],
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 15000,
    }
    const next = base ? io(base, opts) : io(opts)
    next.on('connect', () => {
      connected.value = true
      authRetries = 0
      clearAuthRetry()
    })
    next.on('disconnect', () => (connected.value = false))
    next.on('connect_error', err => {
      const denied = !next.active || (err instanceof Error && err.message === 'unauthorized')
      if (!denied || socket !== next) return
      clearAuthRetry()
      const delay = Math.min(1000 * 2 ** authRetries, 30000)
      authRetries += 1
      authRetryTimer = setTimeout(() => {
        authRetryTimer = null
        if (socket !== next) return
        void refreshSession().finally(() => {
          if (socket === next && !next.connected) next.connect()
        })
      }, delay)
    })
    bindAll(next)
    socket = next
  }

  function disconnect(): void {
    clearAuthRetry()
    authRetries = 0
    socket?.disconnect()
    socket = null
    connected.value = false
  }

  function ensureConnected(): void {
    if (!import.meta.client) return
    if (!socket) connect()
    else if (!socket.connected) socket.connect()
  }

  function on<T>(event: string, handler: (payload: T) => void): () => void {
    const fn = handler as (payload: never) => void
    let set = listeners.get(event)
    if (!set) {
      set = new Set()
      listeners.set(event, set)
    }
    set.add(fn)
    socket?.on(event, fn as (payload: unknown) => void)
    return () => {
      listeners.get(event)?.delete(fn)
      socket?.off(event, fn as (payload: unknown) => void)
    }
  }

  function emit(event: string, payload?: unknown): void {
    socket?.emit(event, payload)
  }

  return { connect, disconnect, ensureConnected, on, emit, connected: readonly(connected) }
}
