export interface Outlet {
  write(data: ArrayBuffer): Promise<void>
  close(): Promise<void>
  abort(): Promise<void>
}

const SW_URL = '/sw-download.js'
const SW_SCOPE = '/dl/'
const KEEPALIVE_MS = 10_000

export function streamSupported() {
  return (
    typeof navigator !== 'undefined' &&
    'serviceWorker' in navigator &&
    typeof ReadableStream !== 'undefined' &&
    window.isSecureContext
  )
}

export function directorySupported() {
  return typeof window !== 'undefined' && 'showDirectoryPicker' in window
}

async function activeWorker() {
  const registration = await navigator.serviceWorker.register(SW_URL, { scope: SW_SCOPE })
  if (registration.active) return registration.active
  const pending = registration.installing ?? registration.waiting
  if (!pending) throw new Error('下载服务不可用')
  await new Promise<void>((resolve, reject) => {
    const check = () => {
      if (pending.state === 'activated') resolve()
      else if (pending.state === 'redundant') reject(new Error('下载服务不可用'))
    }
    pending.addEventListener('statechange', check)
    check()
  })
  return registration.active!
}

export async function openStreamOutlet(name: string, size: number): Promise<Outlet> {
  const worker = await activeWorker()
  const channel = new MessageChannel()
  const port = channel.port1
  const id = crypto.randomUUID()
  const replies: (() => void)[] = []
  let ready: () => void = () => {}
  const opened = new Promise<void>(resolve => {
    ready = resolve
  })
  port.onmessage = event => {
    const message = event.data as { type?: string }
    if (message?.type === 'ready') ready()
    else if (message?.type === 'ack') replies.shift()?.()
  }
  worker.postMessage({ type: 'open', id, name, size }, [channel.port2])
  await opened
  const frame = document.createElement('iframe')
  frame.hidden = true
  frame.src = `${SW_SCOPE}${id}/${encodeURIComponent(name)}`
  document.body.appendChild(frame)
  const keepalive = setInterval(() => port.postMessage({ type: 'ping' }), KEEPALIVE_MS)
  const cleanup = () => {
    clearInterval(keepalive)
    setTimeout(() => frame.remove(), 60_000)
    port.close()
  }
  return {
    write(data) {
      return new Promise<void>(resolve => {
        replies.push(resolve)
        port.postMessage({ type: 'chunk', data }, [data])
      })
    },
    async close() {
      port.postMessage({ type: 'close' })
      cleanup()
    },
    async abort() {
      port.postMessage({ type: 'abort' })
      cleanup()
    },
  }
}

export function memoryOutlet(name: string, mime: string): Outlet {
  const parts: ArrayBuffer[] = []
  return {
    async write(data) {
      parts.push(data)
    },
    async close() {
      const url = URL.createObjectURL(new Blob(parts, { type: mime }))
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = name
      anchor.rel = 'noopener'
      document.body.appendChild(anchor)
      anchor.click()
      anchor.remove()
      parts.length = 0
      setTimeout(() => URL.revokeObjectURL(url), 60_000)
    },
    async abort() {
      parts.length = 0
    },
  }
}
