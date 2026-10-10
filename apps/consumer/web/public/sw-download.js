const streams = new Map()

self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', event => event.waitUntil(self.clients.claim()))

self.addEventListener('message', event => {
  const data = event.data
  if (!data || data.type !== 'open' || !event.ports[0]) return
  const port = event.ports[0]
  let controller = null
  const stream = new ReadableStream({
    start(c) {
      controller = c
    },
    cancel() {
      streams.delete(data.id)
      port.postMessage({ type: 'cancelled' })
    },
  })
  streams.set(data.id, { name: data.name, size: data.size, stream })
  port.onmessage = message => {
    const payload = message.data
    if (!payload || !controller) return
    if (payload.type === 'chunk') {
      try {
        controller.enqueue(new Uint8Array(payload.data))
      } catch {}
      port.postMessage({ type: 'ack' })
    } else if (payload.type === 'close') {
      try {
        controller.close()
      } catch {}
      port.close()
    } else if (payload.type === 'abort') {
      try {
        controller.error(new Error('aborted'))
      } catch {}
      streams.delete(data.id)
      port.close()
    }
  }
  port.postMessage({ type: 'ready' })
})

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url)
  const match = /^\/dl\/([^/]+)\//.exec(url.pathname)
  if (!match) return
  const entry = streams.get(match[1])
  if (!entry) {
    event.respondWith(new Response('', { status: 404 }))
    return
  }
  streams.delete(match[1])
  event.respondWith(
    new Response(entry.stream, {
      headers: {
        'Content-Type': 'application/octet-stream; charset=utf-8',
        'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(entry.name)}`,
        'Content-Length': String(entry.size),
        'Content-Security-Policy': "default-src 'none'",
        'X-Content-Type-Options': 'nosniff',
        'Cache-Control': 'no-store',
      },
    }),
  )
})
