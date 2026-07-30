import { createError, defineEventHandler, isError, setResponseHeader, type H3Event } from 'h3'
import { isRecord } from '#shared/utils/record'
import { isBackendApiError, sendBackendError } from './backend-api'

type PageBffHandler<TData> = (event: H3Event) => Promise<TData> | TData
type PageBffCache = 'private-no-store' | false | { header: string }
interface PageBffOptions {
  cache?: PageBffCache
  /**
   * Where to send the reader when the backend reports that this page's resource was merged into
   * another entry. Returning the target instead of forwarding the 404 keeps inbound links to a
   * de-duplicated id alive; the page turns it into a real redirect via `redirectIfMerged`.
   */
  mergedRedirect?: (mergedInto: number, event: H3Event) => string
}

const PAGE_BFF_CACHE_HEADERS = {
  'private-no-store': 'private, no-store',
} as const

export function definePageBffHandler<TData>(
  handler: PageBffHandler<TData>,
  options: PageBffOptions = {},
) {
  return defineEventHandler(async event => {
    const cacheControl = getCacheControl(options.cache)
    if (cacheControl) setResponseHeader(event, 'cache-control', cacheControl)

    try {
      return await handler(event)
    } catch (error) {
      if (isBackendApiError(error)) {
        const redirect = options.mergedRedirect
        const mergedInto = redirect ? mergedIntoOf(error) : null
        if (redirect && mergedInto != null) {
          return { redirect_to: redirect(mergedInto, event) } as never
        }
        return sendBackendError(event, error)
      }
      if (isError(error)) throw error

      throw createError({
        statusCode: 502,
        statusMessage: 'Bad Gateway',
        message: 'Page data request failed',
        cause: error,
      })
    }
  })
}

function mergedIntoOf(error: { body: unknown }): number | null {
  if (!isRecord(error.body)) return null
  const detail = isRecord(error.body.error) ? error.body.error : null
  if (!detail || detail.code !== 'WIKI_RESOURCE_MERGED') return null
  const details = isRecord(detail.details) ? detail.details : null
  return typeof details?.merged_into === 'number' ? details.merged_into : null
}

function getCacheControl(cache: PageBffCache | undefined) {
  if (cache === false) return undefined
  if (!cache) return PAGE_BFF_CACHE_HEADERS['private-no-store']
  if (typeof cache === 'string') return PAGE_BFF_CACHE_HEADERS[cache]

  return cache.header
}
