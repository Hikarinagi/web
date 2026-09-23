import { describe, expect, it } from 'vitest'
import { isPublicCachedRequest } from '../../server/utils/public-paths'

describe('isPublicCachedRequest', () => {
  it('caches only the site-wide GET endpoints without a query string', () => {
    expect(isPublicCachedRequest('GET', 'site/config', '')).toBe(true)
    expect(isPublicCachedRequest('get', 'site/analytics', '')).toBe(true)
    expect(isPublicCachedRequest('GET', 'promotions/nav-items', '')).toBe(true)
    expect(isPublicCachedRequest('GET', 'promotions/nav-items', '?x=1')).toBe(false)
    expect(isPublicCachedRequest('POST', 'site/config', '')).toBe(false)
    expect(isPublicCachedRequest('GET', 'user/me', '')).toBe(false)
  })
})
