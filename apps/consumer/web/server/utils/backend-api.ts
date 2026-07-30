import type {
  ApiData,
  ApiMethod,
  ApiPath,
  ApiQuery,
  ApiRequestBody,
} from '@hikarinagi/api-contract/v3'
import type {
  ApiBodyOption,
  ApiGetMethod,
  ApiMethodInput,
  ApiPathOption,
  ApiQueryOption,
} from '#shared/utils/api-contract'
import type { ApiFailure, ApiResponse } from '@hikarinagi/shared'
import { setResponseStatus, type H3Event } from 'h3'
import { normalizeApiPath, resolveApiPath, type ApiPathParamValue } from '#shared/utils/api-path'
import { isRecord } from '#shared/utils/record'
import {
  requestBackendWithAuthRefresh,
  serverRuntimeConfig,
  type BackendRequestMethod,
} from './backend-request'

interface BackendDataOptions<TBody = unknown, TQuery = Record<string, unknown>> {
  body?: TBody
  method?: string
  query?: TQuery
}
type BackendApiRequestOptions<TPath extends ApiPath, TMethod extends ApiMethod<TPath>> = Omit<
  BackendDataOptions<ApiRequestBody<TPath, TMethod>, ApiQuery<TPath, TMethod>>,
  'body' | 'method' | 'query'
> &
  ApiPathOption<TPath, TMethod> &
  ApiQueryOption<TPath, TMethod> &
  ApiBodyOption<TPath, TMethod> & {
    method: ApiMethodInput<TMethod>
  }
type BackendApiGetRequestOptions<TPath extends ApiPath> = Omit<
  BackendApiRequestOptions<TPath, ApiGetMethod<TPath>>,
  'body' | 'method'
> & {
  method?: ApiMethodInput<ApiGetMethod<TPath>>
}

export class BackendApiError extends Error {
  readonly status: number
  readonly body: unknown

  constructor(status: number, body: unknown) {
    super('Backend API request failed')
    this.name = 'BackendApiError'
    this.status = status
    this.body = body
  }
}

export function fetchBackendData<TPath extends ApiPath, TMethod extends ApiMethod<TPath>>(
  event: H3Event,
  path: TPath,
  options: BackendApiRequestOptions<TPath, TMethod>,
): Promise<ApiData<TPath, TMethod>>
export function fetchBackendData<TPath extends ApiPath>(
  event: H3Event,
  path: TPath,
  options?: ApiGetMethod<TPath> extends never ? never : BackendApiGetRequestOptions<TPath>,
): Promise<ApiData<TPath, ApiGetMethod<TPath>>>
export async function fetchBackendData<TPath extends ApiPath, TMethod extends ApiMethod<TPath>>(
  event: H3Event,
  path: TPath,
  options?: BackendApiRequestOptions<TPath, TMethod> | BackendApiGetRequestOptions<TPath>,
): Promise<ApiData<TPath, TMethod>> {
  const config = serverRuntimeConfig(event)
  const apiBase = String(config.apiBase).replace(/\/$/, '')
  const requestOptions = options as
    | (BackendDataOptions<unknown, Record<string, unknown>> & {
        path?: Record<string, ApiPathParamValue>
      })
    | undefined
  const { body, method = 'get', path: pathParams, query } = requestOptions ?? {}
  const normalizedPath = normalizeApiPath(resolveApiPath(path, pathParams), apiBase).replace(
    /^\/+/,
    '',
  )
  const response = await requestBackendWithAuthRefresh<
    ApiResponse<ApiData<TPath, TMethod>> | ApiData<TPath, TMethod>
  >(event, {
    apiBase,
    apiPath: normalizedPath,
    body,
    method: method.toUpperCase() as BackendRequestMethod,
    query,
    targetUrl: `${apiBase}/${normalizedPath}`,
  })
  const responseBody: ApiResponse<ApiData<TPath, TMethod>> | ApiData<TPath, TMethod> | undefined =
    response._data

  if (isApiSuccess<ApiData<TPath, TMethod>>(responseBody)) return responseBody.data
  if (isApiFailure(responseBody)) throw new BackendApiError(response.status, responseBody)
  if (response.status >= 400) throw new BackendApiError(response.status, responseBody)

  return responseBody as ApiData<TPath, TMethod>
}

export function isBackendApiError(error: unknown): error is BackendApiError {
  return error instanceof BackendApiError
}

export function sendBackendError(event: H3Event, error: BackendApiError): never {
  setResponseStatus(event, error.status)
  return error.body as never
}

function isApiSuccess<TData>(response: unknown): response is { success: true; data: TData } {
  return isRecord(response) && response.success === true && 'data' in response
}

function isApiFailure(response: unknown): response is ApiFailure {
  return (
    isRecord(response) &&
    response.success === false &&
    isRecord(response.error) &&
    typeof response.error.code === 'string' &&
    typeof response.error.message === 'string' &&
    typeof response.request_id === 'string'
  )
}
