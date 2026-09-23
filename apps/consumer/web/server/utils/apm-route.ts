import { nameRoute } from '@hikarinagi/apm-node/api'
import type { H3Event } from 'h3'

const ORIGIN_BAGGAGE = 'hikari.origin='

export function nameRequestRoute(event: H3Event, route: string): void {
  if (!route) return
  const baggage = event.headers.get('baggage') ?? ''
  nameRoute(event.method, route, { origin: !baggage.includes(ORIGIN_BAGGAGE) })
}

export function matchedRoutePattern(event: H3Event): string {
  const matched = event.context.matchedRoute as { path?: unknown } | undefined
  return typeof matched?.path === 'string' ? matched.path : ''
}
