import {
  HIKARI_BIZ_CODE_STATUS,
  type ApiFailure,
  type ApiResponse,
  type ApiSuccess,
} from '@hikarinagi/shared'
import { isRecord } from '#shared/utils/record'

import { HikariApiError } from './error'

export function isApiSuccess<T>(response: unknown): response is ApiSuccess<T> {
  return isRecord(response) && response.success === true && 'data' in response
}

export function isApiFailure(response: unknown): response is ApiFailure {
  return (
    isRecord(response) &&
    response.success === false &&
    isRecord(response.error) &&
    typeof response.error.code === 'string' &&
    typeof response.error.message === 'string' &&
    typeof response.request_id === 'string'
  )
}

export function unwrapApiResponse<T>(response: ApiResponse<T> | T) {
  if (isApiSuccess<T>(response)) return response.data

  if (isApiFailure(response)) {
    throw new HikariApiError({
      status: HIKARI_BIZ_CODE_STATUS[response.error.code],
      code: response.error.code,
      message: response.error.message,
      request_id: response.request_id,
      field_errors: response.error.field_errors,
      details: response.error.details,
      retryable: response.error.retryable,
    })
  }

  return response as T
}
