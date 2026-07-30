import type {
  LocationQueryRaw,
  LocationQueryValue,
  RouteLocationNormalizedLoaded,
  Router,
} from 'vue-router'
import type { PaginatorRouteMode } from './types'

interface PageRouteOptions {
  omitFirstPage: boolean
  pageParam: string
  pageSizeParam: string
  showPageSize?: boolean
}

export function updatePageRoute(
  router: Router,
  route: RouteLocationNormalizedLoaded,
  mode: PaginatorRouteMode,
  options: PageRouteOptions,
  page: number,
  pageSize: number,
) {
  const query: LocationQueryRaw = { ...route.query }
  query[options.pageParam] = options.omitFirstPage && page === 1 ? undefined : String(page)
  if (options.showPageSize) query[options.pageSizeParam] = String(pageSize)

  return router[mode === 'push' ? 'push' : 'replace']({ query })
}

export function readPageRoute(
  route: RouteLocationNormalizedLoaded,
  options: PageRouteOptions,
  fallbackPageSize: number,
) {
  return {
    page: readPositiveInt(route.query[options.pageParam]) ?? 1,
    pageSize: options.showPageSize
      ? (readPositiveInt(route.query[options.pageSizeParam]) ?? fallbackPageSize)
      : fallbackPageSize,
  }
}

export function pageRouteEquals(
  route: RouteLocationNormalizedLoaded,
  options: PageRouteOptions,
  page: number,
  pageSize: number,
) {
  const expectedPage = options.omitFirstPage && page === 1 ? undefined : String(page)
  const pageMatched = first(route.query[options.pageParam]) === expectedPage
  const pageSizeMatched =
    !options.showPageSize || first(route.query[options.pageSizeParam]) === String(pageSize)

  return pageMatched && pageSizeMatched
}

function readPositiveInt(value: LocationQueryValue | LocationQueryValue[] | undefined) {
  const page = Number(first(value))
  return Number.isInteger(page) && page > 0 ? page : undefined
}

function first(value: LocationQueryValue | LocationQueryValue[] | undefined) {
  const raw = Array.isArray(value) ? value[0] : value
  return typeof raw === 'string' ? raw : undefined
}
