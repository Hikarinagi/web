import type { ApiData } from '@hikarinagi/api-contract/v3'
import { ARTICLE_PRESET, POST_PRESET } from '@hikarinagi/editor-schema'

export type ContentLimits = ApiData<'/api/v3/site/config', 'get'>['content_limits']

const DEFAULTS: ContentLimits = {
  article_entity_cards: ARTICLE_PRESET.limits.max_entity_card_nodes,
  post_entity_cards: POST_PRESET.limits.max_entity_card_nodes,
  post_related_works: 10,
}

export function useContentLimits() {
  return useState<ContentLimits>('site:content-limits', () => ({ ...DEFAULTS }))
}
