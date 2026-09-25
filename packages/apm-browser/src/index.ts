export { createApm, EVENT_PAGE_VIEW, SEVERITY } from './apm.js'
export { nanos, newSpanId, newTraceId, traceparent } from './ids.js'
export { DEFAULT_QUERY_ALLOW_LIST, pathOf, redactQuery } from './redact.js'
export type {
  Apm,
  ApmOptions,
  AttributeValue,
  Attributes,
  FetchOutcome,
  PageView,
  Span,
  SpanEnd,
  SpanKind,
  SpanOptions,
  StatusCode,
} from './types.js'
export { ATTR_OUTCOME, instrumentFetch, type FetchInstrumentationOptions } from './fetch.js'
export { routePattern, UNMATCHED_ROUTE, type MatchedRoute } from './route.js'
