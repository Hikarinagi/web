import type { ApiError } from './error'

export interface ApiMeta {
  [key: string]: unknown
}

export interface ApiSuccess<T> {
  success: true
  data: T
  meta?: ApiMeta
  request_id: string
  timestamp: string
}

export interface ApiFailure {
  success: false
  error: ApiError
  request_id: string
  timestamp: string
}

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure
