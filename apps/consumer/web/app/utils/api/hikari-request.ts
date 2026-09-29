import type {
  ApiData,
  ApiMethod,
  ApiPath,
  ApiQuery,
  ApiRequestBody,
} from '@hikarinagi/api-contract/v3'
import type { ApiResponse } from '@hikarinagi/shared'

import type {
  ApiBodyOption,
  ApiGetMethod,
  ApiMethodInput,
  ApiPathOption,
  ApiQueryOption,
  HikariRequestMethod,
} from './contract'

import { abortErrorOf, normalizeApiError, showApiErrorToast } from './error'
import { normalizeApiPath, resolveApiPath, type ApiPathParamValue } from './path'
import { unwrapApiResponse } from './response'
import { readApiBinary, type DownloadProgress } from './binary'

interface HikariFetchOptions {
  baseURL?: string
  body?: unknown
  credentials?: RequestCredentials
  headers?: HeadersInit
  method?: HikariRequestMethod
  query?: Record<string, unknown>
  signal?: AbortSignal
  responseType?: 'stream'
  ignoreResponseError?: boolean
  retry?: false
}

// Keep imperative API requests on an external-fetch boundary. Nuxt's full
// $fetch type carries Nitro typed routes and can trigger excessive recursion.
type HikariFetch = {
  <T>(request: string, options?: HikariFetchOptions): Promise<T>
  raw<T>(
    request: string,
    options?: HikariFetchOptions,
  ): Promise<{
    status: number
    headers: Headers
    _data?: T
  }>
}

export interface HikariRequestOptions<
  TBody = unknown,
  TQuery = Record<string, unknown>,
> extends Omit<
  HikariFetchOptions,
  | 'baseURL'
  | 'body'
  | 'method'
  | 'params'
  | 'query'
  | 'responseType'
  | 'ignoreResponseError'
  | 'retry'
> {
  method?: HikariRequestMethod
  query?: TQuery
  body?: TBody
  toast?: boolean
  responseType?: 'arrayBuffer'
  onDownload?: (progress: DownloadProgress) => void
  decodeBinary?: (data: ArrayBuffer) => Promise<ArrayBuffer>
}

export type HikariApiRequestOptions<TPath extends ApiPath, TMethod extends ApiMethod<TPath>> = Omit<
  HikariRequestOptions<ApiRequestBody<TPath, TMethod>, ApiQuery<TPath, TMethod>>,
  'body' | 'method' | 'query'
> &
  ApiPathOption<TPath, TMethod> &
  ApiQueryOption<TPath, TMethod> &
  ApiBodyOption<TPath, TMethod> & {
    method: ApiMethodInput<TMethod>
  }

export type HikariApiGetRequestOptions<TPath extends ApiPath> = Omit<
  HikariApiRequestOptions<TPath, ApiGetMethod<TPath>>,
  'body' | 'method'
> & {
  method?: ApiMethodInput<ApiGetMethod<TPath>>
}

export function hikariRequest<TPath extends ApiPath, TMethod extends ApiMethod<TPath>>(
  url: TPath,
  options: HikariApiRequestOptions<TPath, TMethod> & { responseType?: never },
): Promise<ApiData<TPath, TMethod>>
export function hikariRequest<TPath extends ApiPath>(
  url: TPath,
  options?: ApiGetMethod<TPath> extends never
    ? never
    : HikariApiGetRequestOptions<TPath> & { responseType?: never },
): Promise<ApiData<TPath, ApiGetMethod<TPath>>>
export function hikariRequest<TPath extends ApiPath, TMethod extends ApiMethod<TPath>>(
  url: TPath,
  options: HikariApiRequestOptions<TPath, TMethod> & { responseType: 'arrayBuffer' },
): Promise<ArrayBuffer>
export async function hikariRequest<TPath extends ApiPath, TMethod extends ApiMethod<TPath>>(
  url: TPath,
  options?: HikariApiRequestOptions<TPath, TMethod> | HikariApiGetRequestOptions<TPath>,
): Promise<ApiData<TPath, TMethod> | ArrayBuffer> {
  const { $hikariFetch } = useNuxtApp()
  const config = useRuntimeConfig()
  const method = options?.method ? options.method.toUpperCase() : 'GET'
  const pathParams = options && 'path' in options ? options.path : undefined
  const requestOptions = options as
    HikariRequestOptions<unknown, Record<string, unknown>> | undefined
  const {
    query,
    body,
    toast = true,
    responseType,
    onDownload,
    decodeBinary,
    ...fetchOptions
  } = requestOptions ?? {}
  const fetcher = import.meta.server
    ? (useRequestFetch() as unknown as HikariFetch)
    : ($hikariFetch as unknown as HikariFetch)

  try {
    if (responseType === 'arrayBuffer') {
      const response = await fetcher.raw<ReadableStream<Uint8Array>>(
        normalizeApiPath(
          resolveApiPath(url, pathParams as Record<string, ApiPathParamValue> | undefined),
          String(config.public.apiBase),
        ),
        {
          ...fetchOptions,
          baseURL: String(config.public.apiBase),
          method: method as HikariRequestMethod,
          query: query as Record<string, unknown> | undefined,
          body,
          credentials: 'include',
          responseType: 'stream',
          ignoreResponseError: true,
          retry: false,
        },
      )
      const data = await readApiBinary(response, onDownload)
      return decodeBinary ? await decodeBinary(data) : data
    }
    const response = await fetcher<ApiResponse<ApiData<TPath, TMethod>> | ApiData<TPath, TMethod>>(
      normalizeApiPath(
        resolveApiPath(url, pathParams as Record<string, ApiPathParamValue> | undefined),
        String(config.public.apiBase),
      ),
      {
        ...fetchOptions,
        baseURL: String(config.public.apiBase),
        method: method as HikariRequestMethod,
        query: query as Record<string, unknown> | undefined,
        body,
        credentials: 'include',
      },
    )

    return unwrapApiResponse<ApiData<TPath, TMethod>>(response)
  } catch (error) {
    // 中断/取消的请求不是真失败：不弹 toast,原样重抛供上游识别。
    const abort = abortErrorOf(error)
    if (abort) throw abort

    const apiError = normalizeApiError(error)
    if (toast) showApiErrorToast(apiError)
    throw apiError
  }
}
