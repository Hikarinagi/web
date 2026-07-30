export type ApiPathParamValue = string | number | boolean

export function resolveApiPath(path: string, params?: Record<string, ApiPathParamValue>) {
  if (!params) return path

  return Object.entries(params).reduce(
    (resolvedPath, [key, value]) =>
      resolvedPath.replaceAll(`{${key}}`, encodeURIComponent(String(value))),
    path,
  )
}

export function normalizeApiPath(path: string, apiBase: string) {
  const basePath = getApiBasePath(apiBase)
  if (!basePath || basePath === '/') return path
  if (path === basePath) return '/'
  if (path.startsWith(`${basePath}/`)) return path.slice(basePath.length)

  return path
}

function getApiBasePath(apiBase: string) {
  try {
    return new URL(apiBase).pathname.replace(/\/$/, '')
  } catch {
    return apiBase.replace(/\/$/, '')
  }
}
