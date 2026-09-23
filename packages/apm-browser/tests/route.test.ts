import { describe, expect, it } from 'vitest'

import { routePattern, UNMATCHED_ROUTE } from '../src/route'

describe('routePattern', () => {
  it('uses the deepest matched record and strips vue-router regex groups', () => {
    expect(routePattern([{ path: '/galgames/:id()' }])).toBe('/galgames/:id')
    expect(routePattern([{ path: '/mangas/:id()' }, { path: '/mangas/:id()/revisions' }])).toBe(
      '/mangas/:id/revisions',
    )
    expect(routePattern([{ path: '/:slug(.*)*' }])).toBe('/:slug*')
    expect(routePattern([{ path: '/' }])).toBe('/')
  })

  it('falls back to a shared bucket for unmatched paths', () => {
    expect(routePattern([])).toBe(UNMATCHED_ROUTE)
  })
})
