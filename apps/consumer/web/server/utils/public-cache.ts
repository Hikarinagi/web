import { PUBLIC_CACHE_MAX_AGE_SECONDS } from './public-paths'

const fetchPublic = defineCachedFunction(
  async (apiBase: string, apiPath: string): Promise<unknown> => {
    const response = await $fetch.raw<unknown>(`${apiBase}/${apiPath}`, {
      headers: { accept: 'application/json' },
      ignoreResponseError: true,
      timeout: 8_000,
    })
    if (response.status >= 400) {
      throw new Error(`public api ${apiPath} answered ${response.status}`)
    }
    return response._data
  },
  {
    name: 'public-api',
    maxAge: PUBLIC_CACHE_MAX_AGE_SECONDS,
    getKey: (_apiBase: string, apiPath: string) => apiPath,
  },
)

export function cachedPublicBackendBody(apiBase: string, apiPath: string): Promise<unknown> {
  return fetchPublic(apiBase.replace(/\/$/, ''), apiPath)
}
