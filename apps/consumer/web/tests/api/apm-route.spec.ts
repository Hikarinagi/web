import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { H3Event } from 'h3'
import { matchedRoutePattern, nameRequestRoute } from '../../server/utils/apm-route'

const nameRoute = vi.fn()

vi.mock('@hikarinagi/apm-node/api', () => ({
  nameRoute: (...args: unknown[]) => nameRoute(...args),
}))

function event(headers: Record<string, string> = {}, matched?: unknown): H3Event {
  return {
    method: 'GET',
    headers: new Headers(headers),
    context: matched ? { matchedRoute: matched } : {},
  } as unknown as H3Event
}

describe('nameRequestRoute', () => {
  beforeEach(() => {
    nameRoute.mockClear()
  })

  it('names the request as the trace origin when nothing upstream claimed it', () => {
    nameRequestRoute(event(), '/people/:id')
    expect(nameRoute).toHaveBeenCalledWith('GET', '/people/:id', { origin: true })
  })

  it('keeps the browser as the origin when its baggage arrives', () => {
    nameRequestRoute(
      event({ baggage: 'hikari.origin=browser,hikari.origin_name=%2F' }),
      '/api/pages/galgames/:id',
    )
    expect(nameRoute).toHaveBeenCalledWith('GET', '/api/pages/galgames/:id', { origin: false })
  })

  it('does nothing without a route', () => {
    nameRequestRoute(event(), '')
    expect(nameRoute).not.toHaveBeenCalled()
  })
})

describe('matchedRoutePattern', () => {
  it('reads the h3 route pattern and tolerates unmatched requests', () => {
    expect(matchedRoutePattern(event({}, { path: '/api/pages/galgames/:id' }))).toBe(
      '/api/pages/galgames/:id',
    )
    expect(matchedRoutePattern(event())).toBe('')
  })
})
