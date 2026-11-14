import { HIKARI_BIZ_CODE } from '@hikarinagi/shared'
import { failSpan } from '@hikarinagi/apm-node/api'
import type { H3Event } from 'h3'
import { isRecord } from '../../shared/utils/record'

const SERVER_ERROR = 500

export function reportServerError(error: unknown, event?: H3Event): boolean {
  if (isMaintenanceFailure(error)) return false
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

function isMaintenanceFailure(error: unknown): boolean {
  if (!isRecord(error)) return false
  if (error.code === HIKARI_BIZ_CODE.SITE_MAINTENANCE) return true
  if (isRecord(error.cause) && error.cause.code === HIKARI_BIZ_CODE.SITE_MAINTENANCE) return true
  if (isRecord(error.data)) {
    if (error.data.code === HIKARI_BIZ_CODE.SITE_MAINTENANCE) return true
    if (isRecord(error.data.error) && error.data.error.code === HIKARI_BIZ_CODE.SITE_MAINTENANCE) {
      return true
    }
  }
  return false
}

function statusOf(error: unknown): number {
  const status = (error as { statusCode?: unknown }).statusCode
  return typeof status === 'number' ? status : SERVER_ERROR
}
