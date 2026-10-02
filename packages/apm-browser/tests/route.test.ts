import { describe, expect, it } from 'vitest'

import { apiRoute, routePattern, UNMATCHED_ROUTE } from '../src/route'

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

describe('apiRoute', () => {
  it('folds numeric and uuid segments so spans group by endpoint', () => {
    expect(apiRoute('/api/v3/reader/mangas/1337/progress')).toBe(
      '/api/v3/reader/mangas/:id/progress',
    )
    expect(apiRoute('/api/v3/reader/mangas/1678/chapters/38615/pages/1402148/content')).toBe(
      '/api/v3/reader/mangas/:id/chapters/:id/pages/:id/content',
    )
    expect(apiRoute('/_nuxt/builds/meta/89598b46-ca61-4ed3-b4ec-3b58c2325c80.json')).toBe(
      '/_nuxt/builds/meta/89598b46-ca61-4ed3-b4ec-3b58c2325c80.json',
    )
    expect(apiRoute('/api/v3/uploads/89598b46-ca61-4ed3-b4ec-3b58c2325c80')).toBe(
      '/api/v3/uploads/:uuid',
    )
  })

  it('leaves paths without record ids alone', () => {
    expect(apiRoute('/api/v3/user/me')).toBe('/api/v3/user/me')
    expect(apiRoute('/api/v3/site/tracking-config/f5c032f5d47b')).toBe(
      '/api/v3/site/tracking-config/f5c032f5d47b',
    )
    expect(apiRoute('/v1/traces')).toBe('/v1/traces')
    expect(apiRoute('/')).toBe('/')
  })
})
