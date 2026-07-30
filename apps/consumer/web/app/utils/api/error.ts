import {
  HIKARI_BIZ_CODE,
  HIKARI_BIZ_CODE_STATUS,
  type ApiFailure,
  type ApiFieldError,
  type HikariBizCode,
} from '@hikarinagi/shared'
import { push } from 'notivue'
import { isRecord } from '#shared/utils/record'

const HTTP_STATUS_MESSAGE: Partial<Record<number, string>> = {
  400: 'Bad Request',
  401: 'Unauthorized',
  403: 'Forbidden',
  404: 'Not Found',
  409: 'Conflict',
  422: 'Unprocessable Entity',
  429: 'Too Many Requests',
  500: 'Internal Server Error',
  502: 'Bad Gateway',
  503: 'Service Unavailable',
}

interface HikariApiErrorInput {
  status: number
  code: HikariBizCode
  message: string
  request_id?: string
  field_errors?: ApiFieldError[]
  details?: Record<string, unknown>
  retryable?: boolean
  cause?: unknown
}

export class HikariApiError extends Error {
  readonly status: number
  readonly code: HikariBizCode
  readonly request_id?: string
  readonly field_errors?: ApiFieldError[]
  readonly details?: Record<string, unknown>
  readonly retryable: boolean

  constructor(input: HikariApiErrorInput) {
    super(input.message, { cause: input.cause })
    this.name = 'HikariApiError'
    this.status = input.status
    this.code = input.code
    this.request_id = input.request_id
    this.field_errors = input.field_errors
    this.details = input.details
    this.retryable = input.retryable ?? false
  }
}

export function isApiError(error: unknown): error is HikariApiError {
  return error instanceof HikariApiError
}

export function abortErrorOf(error: unknown): unknown {
  let current: unknown = error
  for (let depth = 0; depth < 5 && current != null; depth++) {
    if (isRecord(current) && current.name === 'AbortError') return current
    current = isRecord(current) ? current.cause : null
  }
  return null
}

export function isAbortError(error: unknown): boolean {
  return abortErrorOf(error) !== null
}

export function getFieldErrors(error: unknown): Record<string, string> {
  if (!isApiError(error) || !error.field_errors?.length) return {}

  return Object.fromEntries(error.field_errors.map(item => [item.field, item.message]))
}

function formatValue(value: unknown): string {
  if (value == null) return ''
  if (typeof value === 'string') return value
  if (typeof value === 'number' || typeof value === 'boolean') return String(value)
  if (Array.isArray(value)) return value.map(formatValue).filter(Boolean).join('、')
  return JSON.stringify(value)
}

function formatDetails(details: Record<string, unknown> | undefined): string {
  if (!details) return ''
  return Object.entries(details)
    .map(([key, value]) => {
      const text = formatValue(value)
      return text ? `${key}: ${text}` : ''
    })
    .filter(Boolean)
    .join('\n')
}

export function showApiErrorToast(error: HikariApiError) {
  if (!import.meta.client) return

  const detail = formatDetails(error.details)
  push.error({
    title: '请求失败',
    message: detail ? `${error.message}\n${detail}` : error.message,
  })
}

export function isAuthError(error: unknown) {
  return isApiError(error) && error.status === 401
}

export function isNotFoundError(error: unknown) {
  return isApiError(error) && error.status === 404
}

export function isValidationError(error: unknown) {
  return isApiError(error) && error.code === HIKARI_BIZ_CODE.COMMON_VALIDATION_FAILED
}

export function getHttpStatusMessage(status: number) {
  return HTTP_STATUS_MESSAGE[status] ?? (status >= 500 ? 'Server Error' : 'Request Error')
}

export function toNuxtError(error: unknown, options: { fatal?: boolean } = {}) {
  const apiError = normalizeApiError(error)
  const statusText = getHttpStatusMessage(apiError.status)

  return createError({
    status: apiError.status,
    statusText,
    message: apiError.message,
    fatal: options.fatal ?? false,
    data: {
      code: apiError.code,
      message: apiError.message,
      request_id: apiError.request_id,
      field_errors: apiError.field_errors,
      details: apiError.details,
      retryable: apiError.retryable,
    },
    cause: apiError,
  })
}

export function toPageError(error: unknown) {
  return toNuxtError(error, { fatal: true })
}

export function throwPageError(error: unknown): never {
  throw toPageError(error)
}

export function normalizeApiError(error: unknown) {
  if (isApiError(error)) return error

  if (isRecord(error) && isApiError(error.cause)) return error.cause

  const data = getErrorData(error)
  if (isApiFailure(data)) {
    return new HikariApiError({
      status: getErrorStatus(error, data.error.code),
      code: data.error.code,
      message: data.error.message,
      request_id: data.request_id,
      field_errors: data.error.field_errors,
      details: data.error.details,
      retryable: data.error.retryable,
      cause: error,
    })
  }

  if (isFetchErrorLike(error)) {
    return new HikariApiError({
      status: getErrorStatus(error, HIKARI_BIZ_CODE.COMMON_SERVICE_UNAVAILABLE),
      code: HIKARI_BIZ_CODE.COMMON_SERVICE_UNAVAILABLE,
      message: getErrorMessage(error) ?? '服务暂时不可用',
      cause: error,
      retryable: true,
    })
  }

  return new HikariApiError({
    status: HIKARI_BIZ_CODE_STATUS[HIKARI_BIZ_CODE.COMMON_UNEXPECTED_ERROR],
    code: HIKARI_BIZ_CODE.COMMON_UNEXPECTED_ERROR,
    message: getErrorMessage(error) ?? '请求失败',
    cause: error,
  })
}

function isApiFailure(value: unknown): value is ApiFailure {
  return (
    isRecord(value) &&
    value.success === false &&
    isRecord(value.error) &&
    typeof value.error.code === 'string' &&
    typeof value.error.message === 'string' &&
    typeof value.request_id === 'string'
  )
}

function getErrorData(error: unknown) {
  if (!isRecord(error)) return undefined
  if ('data' in error) return error.data

  const response = error.response
  if (isRecord(response) && '_data' in response) return response._data

  return undefined
}

function getErrorStatus(error: unknown, fallbackCode: HikariBizCode) {
  if (isRecord(error)) {
    if (typeof error.status === 'number') return error.status
    if (typeof error.statusCode === 'number') return error.statusCode

    const response = error.response
    if (isRecord(response) && typeof response.status === 'number') return response.status
  }

  return HIKARI_BIZ_CODE_STATUS[fallbackCode]
}

function getErrorMessage(error: unknown) {
  if (isRecord(error) && typeof error.message === 'string') return error.message
  return error instanceof Error ? error.message : undefined
}

function isFetchErrorLike(error: unknown) {
  return (
    isRecord(error) &&
    ('request' in error || 'response' in error || 'status' in error || 'statusCode' in error)
  )
}
