import type { paths } from './generated/v3'

export type { components, operations, paths } from './generated/v3'

export type ApiPath = keyof paths

type HttpMethod = 'delete' | 'get' | 'patch' | 'post' | 'put'

export type ApiMethod<TPath extends ApiPath> = {
  [TMethod in HttpMethod]: TMethod extends keyof paths[TPath]
    ? NonNullable<paths[TPath][TMethod]> extends never
      ? never
      : TMethod
    : never
}[HttpMethod]

type Operation<TPath extends ApiPath, TMethod extends ApiMethod<TPath>> = NonNullable<
  paths[TPath][TMethod]
>

type ResponseContent<TResponses, TStatus extends number> = TStatus extends keyof TResponses
  ? TResponses[TStatus] extends { content: { 'application/json': infer TContent } }
    ? TContent
    : TStatus extends 204
      ? void
      : unknown
  : never

type SuccessResponseBody<T> = T extends { responses: infer TResponses }
  ?
      | ResponseContent<TResponses, 200>
      | ResponseContent<TResponses, 201>
      | ResponseContent<TResponses, 202>
      | ResponseContent<TResponses, 204>
  : never

type RequestBody<T> = T extends { requestBody?: infer TBody }
  ? TBody extends { content: { 'application/json': infer TContent } }
    ? TContent
    : TBody extends { content: { 'multipart/form-data': unknown } }
      ? FormData
      : never
  : never

type Parameters<T> = T extends { parameters: infer TParameters } ? TParameters : never

export type ApiResponseBody<
  TPath extends ApiPath,
  TMethod extends ApiMethod<TPath>,
> = SuccessResponseBody<Operation<TPath, TMethod>>

export type ApiData<TPath extends ApiPath, TMethod extends ApiMethod<TPath>> =
  ApiResponseBody<TPath, TMethod> extends { success: true; data: infer TData }
    ? TData
    : ApiResponseBody<TPath, TMethod>

export type ApiRequestBody<TPath extends ApiPath, TMethod extends ApiMethod<TPath>> = RequestBody<
  Operation<TPath, TMethod>
>

export type ApiQuery<TPath extends ApiPath, TMethod extends ApiMethod<TPath>> =
  Parameters<Operation<TPath, TMethod>> extends { query?: infer TQuery } ? TQuery : never

export type ApiPathParams<TPath extends ApiPath, TMethod extends ApiMethod<TPath>> =
  Parameters<Operation<TPath, TMethod>> extends { path?: infer TParams } ? TParams : never
