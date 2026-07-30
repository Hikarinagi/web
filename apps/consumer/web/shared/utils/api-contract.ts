import type {
  ApiMethod,
  ApiPath,
  ApiPathParams,
  ApiQuery,
  ApiRequestBody,
} from '@hikarinagi/api-contract/v3'

export type HikariRequestMethod = 'DELETE' | 'GET' | 'PATCH' | 'POST' | 'PUT'

export type ApiMethodInput<TMethod extends string> = TMethod | Uppercase<TMethod>

export type ApiGetMethod<TPath extends ApiPath> = Extract<ApiMethod<TPath>, 'get'>

type EmptyApiParam<TValue> = [TValue] extends [never]
  ? true
  : [TValue] extends [undefined]
    ? true
    : false

export type ApiPathOption<TPath extends ApiPath, TMethod extends ApiMethod<TPath>> = [
  EmptyApiParam<ApiPathParams<TPath, TMethod>>,
] extends [true]
  ? { path?: never }
  : { path: ApiPathParams<TPath, TMethod> }

export type ApiQueryOption<TPath extends ApiPath, TMethod extends ApiMethod<TPath>> = [
  EmptyApiParam<ApiQuery<TPath, TMethod>>,
] extends [true]
  ? { query?: never }
  : { query?: ApiQuery<TPath, TMethod> }

export type ApiBodyOption<TPath extends ApiPath, TMethod extends ApiMethod<TPath>> = [
  EmptyApiParam<ApiRequestBody<TPath, TMethod>>,
] extends [true]
  ? { body?: never }
  : { body: ApiRequestBody<TPath, TMethod> }
