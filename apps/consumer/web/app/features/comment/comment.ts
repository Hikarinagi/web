import type { ApiData, components } from '@hikarinagi/api-contract/v3'

export type CommentTargetType = components['schemas']['CreateCommentDto']['target_type']

export type CommentList = ApiData<'/api/v3/comments', 'get'>
export type CommentItem = CommentList['page']['items'][number]
export type CommentNode = CommentItem['children'][number]
export type CommentSummaries = CommentList['entity_summaries']
export type CommentEmojiSets = CommentList['emoji_sets']
export type CommentVoteState = ApiData<'/api/v3/comments/{id}/vote', 'post'>

export type CommentSort = 'hot' | 'time_desc'

export const COMMENT_SECTION_ID = 'comments'
export const COMMENT_SECTION_HASH = `#${COMMENT_SECTION_ID}`
export const COMMENT_FOCUS_EVENT = 'hikari:comment-focus'
export const COMMENT_MAX_ATTACHMENTS = 9

export function commentFocusId(raw: unknown): number | null {
  const value = Array.isArray(raw) ? raw[0] : raw
  const n = typeof value === 'string' ? Number(value) : NaN
  return Number.isInteger(n) && n > 0 ? n : null
}

export const COMMENT_PAGE_SIZE = 10

export function requestCommentFocus() {
  if (!import.meta.client) return
  ;(globalThis as typeof globalThis & { dispatchEvent: (event: Event) => boolean }).dispatchEvent(
    new Event(COMMENT_FOCUS_EVENT),
  )
}

function dedupById<T extends { id: number }>(list: T[]): T[] {
  const seen = new Set<number>()
  return list.filter(x => (seen.has(x.id) ? false : (seen.add(x.id), true)))
}

export function mergeSummaries(a: CommentSummaries, b: CommentSummaries): CommentSummaries {
  const out = {} as CommentSummaries
  for (const key of Object.keys(a) as (keyof CommentSummaries)[]) {
    out[key] = dedupById([...a[key], ...b[key]] as { id: number }[]) as never
  }
  return out
}

export function mergeEmojiSets(a: CommentEmojiSets, b: CommentEmojiSets): CommentEmojiSets {
  const byId = new Map<number, CommentEmojiSets[number]>()
  for (const set of [...a, ...b]) {
    const prev = byId.get(set.id)
    byId.set(set.id, prev ? { ...set, emojis: dedupById([...prev.emojis, ...set.emojis]) } : set)
  }
  return [...byId.values()]
}
