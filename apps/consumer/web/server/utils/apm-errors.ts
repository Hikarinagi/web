import { failSpan } from '@hikarinagi/apm-node/api'
import type { H3Event } from 'h3'

const SERVER_ERROR = 500

export function reportServerError(error: unknown, event?: H3Event): boolean {
  const status = statusOf(error)
  if (status < SERVER_ERROR) return false
  const cause = (error as { cause?: unknown }).cause
  failSpan(cause instanceof Error ? cause : error, {
    'http.response.status_code': status,
    ...(event
      ? { 'url.path': event.path.split('?')[0] ?? event.path, 'http.request.method': event.method }
      : {}),
  })
  return true
}

function statusOf(error: unknown): number {
  const status = (error as { statusCode?: unknown }).statusCode
  return typeof status === 'number' ? status : SERVER_ERROR
}
