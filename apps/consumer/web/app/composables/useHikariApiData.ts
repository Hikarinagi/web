import type {
  ApiData,
  ApiMethod,
  ApiPath,
  ApiPathParams,
  ApiQuery,
  ApiRequestBody,
} from '@hikarinagi/api-contract/v3'
import type { ApiResponse } from '@hikarinagi/shared'
import type { TypedInternalResponse } from 'nitropack/types'
import type { UseFetchOptions } from 'nuxt/app'
import type { MaybeRefOrGetter } from 'vue'
import { toValue } from 'vue'

import type { HikariApiError } from '../utils/api/error'
import type {
  ApiBodyOption,
  ApiGetMethod,
  ApiMethodInput,
  ApiPathOption,
  ApiQueryOption,
  HikariRequestMethod,
} from '../utils/api/contract'

import {
  abortErrorOf,
  normalizeApiError,
  showApiErrorToast,
  throwPageError,
  toNuxtError,
} from '../utils/api/error'
import { type ApiPathParamValue, normalizeApiPath, resolveApiPath } from '../utils/api/path'
import { unwrapApiResponse } from '../utils/api/response'

type HikariApiDataMethod = HikariRequestMethod | Lowercase<HikariRequestMethod>
// Keep useFetch's request generic opaque so Nitro typed routes do not deeply
// match the v3 proxy route and trigger excessive TypeScript recursion.
type HikariApiDataRequest = string & {}
type PageBffPath = `/api/pages/${string}`
type PageBffData<TPath extends PageBffPath> = TypedInternalResponse<TPath, unknown, 'get'>
type HikariUseFetchOptions<TData> = UseFetchOptions<
  ApiResponse<TData> | TData,
  TData,
  [],
  undefined,
  HikariApiDataRequest,
  HikariApiDataMethod
>

export type HikariApiDataOptions<TData, TBody = unknown, TQuery = Record<string, unknown>> = Omit<
  UseFetchOptions<
    ApiResponse<TData> | TData,
    TData,
    [],
    undefined,
    HikariApiDataRequest,
    HikariApiDataMethod
  >,
  '$fetch' | 'body' | 'default' | 'method' | 'query' | 'transform'
> & {
  body?: TBody
  fatal?: boolean
  method?: HikariApiDataMethod
  query?: TQuery
  toast?: boolean
}

export type HikariApiDataRequestOptions<
  TPath extends ApiPath,
  TMethod extends ApiMethod<TPath>,
> = Omit<
  HikariApiDataOptions<
    ApiData<TPath, TMethod>,
    ApiRequestBody<TPath, TMethod>,
    ApiQuery<TPath, TMethod>
  >,
  'body' | 'method' | 'query'
> &
  ApiPathOption<TPath, TMethod> &
  ApiQueryOption<TPath, TMethod> &
  ApiBodyOption<TPath, TMethod> & {
    method: ApiMethodInput<TMethod>
  }

export type HikariApiDataGetRequestOptions<TPath extends ApiPath> = Omit<
  HikariApiDataRequestOptions<TPath, ApiGetMethod<TPath>>,
  'body' | 'method'
> & {
  method?: ApiMethodInput<ApiGetMethod<TPath>>
}

export function useHikariApiData<TPath extends PageBffPath>(
  url: MaybeRefOrGetter<TPath>,
  options?: HikariApiDataOptions<PageBffData<TPath>>,
): ReturnType<typeof useResolvedApiData<PageBffData<TPath>>>
export function useHikariApiData<TData>(
  url: MaybeRefOrGetter<PageBffPath>,
  options?: HikariApiDataOptions<TData>,
): ReturnType<typeof useResolvedApiData<TData>>
export function useHikariApiData<TPath extends ApiPath, TMethod extends ApiMethod<TPath>>(
  url: TPath,
  options: HikariApiDataRequestOptions<TPath, TMethod>,
): ReturnType<typeof useResolvedApiData<ApiData<TPath, TMethod>>>
export function useHikariApiData<TPath extends ApiPath>(
  url: TPath,
  options?: ApiGetMethod<TPath> extends never ? never : HikariApiDataGetRequestOptions<TPath>,
): ReturnType<typeof useResolvedApiData<ApiData<TPath, ApiGetMethod<TPath>>>>
export function useHikariApiData<TPath extends ApiPath, TMethod extends ApiMethod<TPath>>(
  url: TPath | MaybeRefOrGetter<PageBffPath>,
  options?:
    | HikariApiDataOptions<unknown>
    | HikariApiDataRequestOptions<TPath, TMethod>
    | HikariApiDataGetRequestOptions<TPath>,
) {
  if (typeof url !== 'string') {
    return useResolvedApiData(url, options as HikariApiDataOptions<unknown> | undefined)
  }

  const method = options?.method ? options.method.toUpperCase() : 'GET'
  const resolvedOptions = options as
    | (HikariApiDataOptions<unknown> & { path?: Record<string, ApiPathParamValue> })
    | undefined
  const pathParams = resolvedOptions?.path
  const { path: _path, ...fetchOptions } = resolvedOptions ?? {}

  return useResolvedApiData(
    resolveApiPath(
      url,
      pathParams as ApiPathParams<TPath, TMethod> extends never
        ? undefined
        : Record<string, ApiPathParamValue>,
    ),
    {
      ...fetchOptions,
      method: method as HikariApiDataMethod,
    },
  )
}

function useResolvedApiData<TData>(
  url: MaybeRefOrGetter<string>,
  options: HikariApiDataOptions<TData> = {},
) {
  const config = useRuntimeConfig()
  const { body, fatal = false, query, toast = true, ...fetchOptions } = options
  const requestUrl = () => {
    const resolvedUrl = toValue(url)
    if (isPageBffPath(resolvedUrl)) return resolvedUrl

    return normalizeApiPath(resolvedUrl, String(config.public.apiBase))
  }
  const requestBaseUrl = () => {
    const resolvedUrl = toValue(url)
    if (isPageBffPath(resolvedUrl)) return undefined

    return String(config.public.apiBase)
  }

  const useFetchOptions: HikariUseFetchOptions<TData> = {
    retry: false,
    ...fetchOptions,
    baseURL: requestBaseUrl(),
    body: body as HikariUseFetchOptions<TData>['body'],
    credentials: 'include',
    query: query as HikariUseFetchOptions<TData>['query'],
    transform: response => unwrapApiResponse<TData>(response),
    onRequestError: ({ error }) => {
      throwFetchError(error, toast)
    },
    onResponseError: ({ response }) => {
      throwFetchError(
        {
          response,
          data: response._data,
          status: response.status,
          statusText: response.statusText,
        },
        toast,
      )
    },
  }

  const asyncData = useFetch<
    ApiResponse<TData> | TData,
    HikariApiError,
    HikariApiDataRequest,
    HikariApiDataMethod,
    ApiResponse<TData> | TData,
    TData,
    []
  >(requestUrl, useFetchOptions)

  if (!fatal) return asyncData

  const fatalData = asyncData.then(resolved => {
    if (resolved.error.value) throwPageError(resolved.error.value)
    return resolved
  }) as typeof asyncData

  fatalData.data = asyncData.data
  fatalData.pending = asyncData.pending
  fatalData.error = asyncData.error
  fatalData.status = asyncData.status
  fatalData.refresh = asyncData.refresh
  fatalData.execute = asyncData.execute
  fatalData.clear = asyncData.clear

  return fatalData
}

function isPageBffPath(url: string): url is `/api/pages/${string}` {
  return url.startsWith('/api/pages/')
}

function throwFetchError(error: unknown, toast: boolean): never {
  const abort = abortErrorOf(error)
  if (abort) throw abort

  const apiError = normalizeApiError(error)
  if (toast) showApiErrorToast(apiError)

  throw toNuxtError(apiError)
}
