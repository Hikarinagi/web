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

const REQUEST_BODY_METHODS = new Set(['DELETE', 'PATCH', 'POST', 'PUT'])

export default defineEventHandler(async (event): Promise<unknown> => {
  const config = useRuntimeConfig()
  const method = event.method.toUpperCase()
  const apiPath = getRouterParam(event, 'path') ?? ''
  const apiBase = String(config.apiBase).replace(/\/$/, '')
  const targetUrl = `${apiBase}/${apiPath}${getRequestURL(event).search}`
  const requestBody = REQUEST_BODY_METHODS.has(method) ? await readRawBody(event, false) : undefined

  try {
    const response = await requestBackendWithAuthRefresh(event, {
      apiBase,
      apiPath,
      body: requestBody,
      forwardResponseHeaders: true,
      method: method as BackendRequestMethod,
      targetUrl,
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
