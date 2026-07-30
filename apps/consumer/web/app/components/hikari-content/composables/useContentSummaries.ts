import type { components } from '@hikarinagi/api-contract/v3'
import { computed, inject, provide, type ComputedRef, type InjectionKey } from 'vue'

type Schemas = components['schemas']

export type EntitySummaries = Schemas['EntitySummariesResDto']
export type GalgameCardSummary = Schemas['GalgameCardSummaryResDto']
export type LightNovelCardSummary = Schemas['LightNovelCardSummaryResDto']
export type LightNovelVolumeCardSummary = Schemas['LightNovelVolumeCardSummaryResDto']
export type MangaCardSummary = Schemas['MangaCardSummaryResDto']
export type PersonCardSummary = Schemas['PersonCardSummaryResDto']
export type ProducerCardSummary = Schemas['ProducerCardSummaryResDto']
export type CharacterCardSummary = Schemas['CharacterCardSummaryResDto']
export type ArticleCardSummary = Schemas['ArticleCardSummaryResDto']
export type PostCardSummary = Schemas['PostCardSummaryResDto']
export type GalgameRateCardSummary = Schemas['GalgameRateCardSummaryResDto']
export type LightNovelRateCardSummary = Schemas['LightNovelRateCardSummaryResDto']
export type MangaRateCardSummary = Schemas['MangaRateCardSummaryResDto']
export type MentionUserSummary = Schemas['MentionUserSummaryResDto']
export type CommentCardSummary = Schemas['CommentCardSummaryResDto']
export type PollCardSummary = Schemas['PollResDto']

interface SummaryIndex {
  galgames: Map<number, GalgameCardSummary>
  light_novels: Map<number, LightNovelCardSummary>
  light_novel_volumes: Map<number, LightNovelVolumeCardSummary>
  mangas: Map<number, MangaCardSummary>
  persons: Map<number, PersonCardSummary>
  producers: Map<number, ProducerCardSummary>
  characters: Map<number, CharacterCardSummary>
  articles: Map<number, ArticleCardSummary>
  posts: Map<number, PostCardSummary>
  galgame_rates: Map<number, GalgameRateCardSummary>
  light_novel_rates: Map<number, LightNovelRateCardSummary>
  manga_rates: Map<number, MangaRateCardSummary>
  mention_users: Map<number, MentionUserSummary>
  comments: Map<number, CommentCardSummary>
  polls: Map<string, PollCardSummary>
}

const EMPTY_INDEX: SummaryIndex = {
  galgames: new Map(),
  light_novels: new Map(),
  light_novel_volumes: new Map(),
  mangas: new Map(),
  persons: new Map(),
  producers: new Map(),
  characters: new Map(),
  articles: new Map(),
  posts: new Map(),
  galgame_rates: new Map(),
  light_novel_rates: new Map(),
  manga_rates: new Map(),
  mention_users: new Map(),
  comments: new Map(),
  polls: new Map(),
}

export const HIKARI_CONTENT_SUMMARIES_KEY: InjectionKey<ComputedRef<SummaryIndex>> = Symbol(
  'hikari-content-summaries',
)

export function provideContentSummaries(source: () => EntitySummaries | null | undefined): void {
  const indexed = computed<SummaryIndex>(() => {
    const s = source()
    if (!s) return EMPTY_INDEX
    return {
      galgames: byId(s.galgames),
      light_novels: byId(s.light_novels),
      light_novel_volumes: byId(s.light_novel_volumes),
      mangas: byId(s.mangas),
      persons: byId(s.persons),
      producers: byId(s.producers),
      characters: byId(s.characters),
      articles: byId(s.articles),
      posts: byId(s.posts),
      galgame_rates: byId(s.galgame_rates),
      light_novel_rates: byId(s.light_novel_rates),
      manga_rates: byId(s.manga_rates),
      mention_users: byId(s.mention_users),
      comments: byId(s.comments),
      polls: new Map((s.polls ?? []).map(p => [p.poll_key, p])),
    }
  })
  provide(HIKARI_CONTENT_SUMMARIES_KEY, indexed)
}

export function useContentSummaries(): ComputedRef<SummaryIndex> {
  const injected = inject(HIKARI_CONTENT_SUMMARIES_KEY, null)
  if (injected) return injected
  return computed(() => EMPTY_INDEX)
}

function byId<T extends { id: number }>(list: T[] | null | undefined): Map<number, T> {
  const m = new Map<number, T>()
  for (const item of list ?? []) m.set(item.id, item)
  return m
}
