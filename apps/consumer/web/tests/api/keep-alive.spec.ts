import { createServer } from 'node:http'
import { describe, expect, it } from 'vitest'
import {
  HEADERS_TIMEOUT_MS,
  KEEP_ALIVE_TIMEOUT_MS,
  serverOf,
  tuneKeepAlive,
} from '../../server/utils/keep-alive'

describe('keep-alive tuning', () => {
  it('keeps idle connections open longer than the proxy in front of us', () => {
    const server = createServer()
    expect(server.keepAliveTimeout).toBeLessThan(KEEP_ALIVE_TIMEOUT_MS)
    tuneKeepAlive(server)
    expect(server.keepAliveTimeout).toBe(KEEP_ALIVE_TIMEOUT_MS)
    expect(server.headersTimeout).toBe(HEADERS_TIMEOUT_MS)
    expect(server.headersTimeout).toBeGreaterThan(server.keepAliveTimeout)
    expect(KEEP_ALIVE_TIMEOUT_MS).toBeGreaterThan(90_000)
    server.close()
  })

  it('finds the listening server through the request socket', () => {
    const server = createServer()
    expect(serverOf({ socket: { server } } as never)).toBe(server)
    expect(serverOf({ socket: {} } as never)).toBeUndefined()
    const lookalike = { keepAliveTimeout: 1, headersTimeout: 1 }
    expect(serverOf({ socket: { server: lookalike } } as never)).toBeUndefined()
    server.close()
  })
})
