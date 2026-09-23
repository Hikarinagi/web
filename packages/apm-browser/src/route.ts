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
