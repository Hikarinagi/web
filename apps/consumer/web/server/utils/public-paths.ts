const PUBLIC_CACHED_PATHS = new Set(['site/config', 'site/analytics', 'promotions/nav-items'])

export const PUBLIC_CACHE_MAX_AGE_SECONDS = 60

export function isPublicCachedRequest(method: string, apiPath: string, search: string): boolean {
  return method.toUpperCase() === 'GET' && search === '' && PUBLIC_CACHED_PATHS.has(apiPath)
}
