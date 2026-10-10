import type { IncomingMessage } from 'node:http'
import { Server } from 'node:net'

export const KEEP_ALIVE_TIMEOUT_MS = 95_000
export const HEADERS_TIMEOUT_MS = 96_000

export interface KeepAliveServer {
  keepAliveTimeout: number
  headersTimeout: number
}

function isKeepAliveServer(value: unknown): value is KeepAliveServer {
  return value instanceof Server && 'keepAliveTimeout' in value && 'headersTimeout' in value
}

export function serverOf(request: IncomingMessage): KeepAliveServer | undefined {
  const { socket } = request
  return 'server' in socket && isKeepAliveServer(socket.server) ? socket.server : undefined
}

export function tuneKeepAlive(server: KeepAliveServer): void {
  server.keepAliveTimeout = KEEP_ALIVE_TIMEOUT_MS
  server.headersTimeout = HEADERS_TIMEOUT_MS
}
