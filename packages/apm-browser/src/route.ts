export interface MatchedRoute {
  path: string
}

export const UNMATCHED_ROUTE = '/*'

export function routePattern(matched: ReadonlyArray<MatchedRoute>): string {
  const leaf = matched[matched.length - 1]
  if (!leaf || !leaf.path) return UNMATCHED_ROUTE
  const pattern = leaf.path.replace(/\([^)]*\)/g, '')
  return pattern || '/'
}

const UUID_SEGMENT = /\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}(?=\/|$)/gi
const NUMERIC_SEGMENT = /\/\d+(?=\/|$)/g

export function apiRoute(path: string): string {
  return path.replace(UUID_SEGMENT, '/:uuid').replace(NUMERIC_SEGMENT, '/:id')
}
