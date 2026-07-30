import { CF_CONNECTING_IP_HEADER, X_FORWARDED_FOR_HEADER, X_REAL_IP_HEADER } from './header'

export interface ClientIpRequest {
  ip?: string
  headers?: Record<string, string | string[] | undefined>
}

const firstHeader = (value?: string | string[]) => (Array.isArray(value) ? value[0] : value)?.trim()

export function resolveClientIp(req?: ClientIpRequest): string {
  const headers = req?.headers
  return (
    firstHeader(headers?.[CF_CONNECTING_IP_HEADER]) ||
    firstHeader(headers?.[X_REAL_IP_HEADER]) ||
    firstHeader(headers?.[X_FORWARDED_FOR_HEADER])?.split(',')[0]?.trim() ||
    req?.ip ||
    ''
  )
}
