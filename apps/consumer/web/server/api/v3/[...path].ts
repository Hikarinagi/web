import {
  createError,
  defineEventHandler,
  getRequestURL,
  getRouterParam,
  readRawBody,
  setResponseStatus,
} from 'h3'
import {
  requestBackendWithAuthRefresh,
  type BackendRequestMethod,
} from '../../utils/backend-request'
import { cachedPublicBackendBody } from '../../utils/public-cache'
import { isPublicCachedRequest } from '../../utils/public-paths'

const REQUEST_BODY_METHODS = new Set(['DELETE', 'PATCH', 'POST', 'PUT'])

export default defineEventHandler(async (event): Promise<unknown> => {
  const config = useRuntimeConfig()
  const method = event.method.toUpperCase()
  const apiPath = getRouterParam(event, 'path') ?? ''
  const apiBase = String(config.apiBase).replace(/\/$/, '')
  const search = getRequestURL(event).search
  const targetUrl = `${apiBase}/${apiPath}${search}`
  const binary =
    (method === 'POST' && /^reader\/mangas\/\d+\/chapters\/\d+\/pages\/\d+\/content$/.test(apiPath)) ||
    (method === 'GET' && /^reader\/sessions\/[^/]+\/content$/.test(apiPath)) ||
    (method === 'POST' && /^user\/me\/novel\/download\/volumes\/\d+$/.test(apiPath)) ||
    (method === 'POST' && /^user\/me\/manga\/download\/mangas\/\d+\/files$/.test(apiPath))
  const plan =
    method === 'POST' &&
    /^user\/me\/(?:novel\/download\/series|manga\/download\/mangas)\/\d+\/plan$/.test(apiPath)
  if (isPublicCachedRequest(method, apiPath, search)) {
    return cachedPublicBackendBody(apiBase, apiPath)
  }
  const requestBody = REQUEST_BODY_METHODS.has(method) ? await readRawBody(event, false) : undefined
  const abort = binary || plan ? new AbortController() : undefined
  if (abort) {
    event.node.res.once('close', () => abort.abort())
    if (event.node.res.destroyed) abort.abort()
  }

  try {
    const response = await requestBackendWithAuthRefresh(event, {
      apiBase,
      apiPath,
      body: requestBody,
      forwardResponseHeaders: true,
      method: method as BackendRequestMethod,
      targetUrl,
      ...(binary ? { responseType: 'stream' as const } : {}),
      ...(abort ? { signal: abort.signal } : {}),
    })
    setResponseStatus(event, response.status)

    return response._data
  } catch (error) {
    throw createError({
      statusCode: 502,
      statusMessage: 'Backend API request failed',
      cause: error,
    })
  }
})
