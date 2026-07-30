import type { Ref } from 'vue'
import type {
  EntitySummaries,
  MentionUserSummary,
  GalgameCardSummary,
  LightNovelCardSummary,
  LightNovelVolumeCardSummary,
  MangaCardSummary,
  PersonCardSummary,
  ProducerCardSummary,
  CharacterCardSummary,
  ArticleCardSummary,
  PostCardSummary,
  GalgameRateCardSummary,
  LightNovelRateCardSummary,
  MangaRateCardSummary,
} from '~/components/hikari-content/composables/useContentSummaries'

// ref 是显式参数而非 inject:Vue inject 不读 currentInstance 自己的 provides,
// 编辑器宿主(page) 同 setup 内 provide+inject 必失败。

export function emptyEditorSummaries(): EntitySummaries {
  return {
    galgames: [],
    light_novels: [],
    light_novel_volumes: [],
    mangas: [],
    persons: [],
    producers: [],
    characters: [],
    articles: [],
    posts: [],
    galgame_rates: [],
    light_novel_rates: [],
    manga_rates: [],
    mention_users: [],
    comments: [],
    polls: [],
  }
}

type EntitySummaryByKey = {
  galgames: GalgameCardSummary
  light_novels: LightNovelCardSummary
  light_novel_volumes: LightNovelVolumeCardSummary
  mangas: MangaCardSummary
  persons: PersonCardSummary
  producers: ProducerCardSummary
  characters: CharacterCardSummary
  articles: ArticleCardSummary
  posts: PostCardSummary
  galgame_rates: GalgameRateCardSummary
  light_novel_rates: LightNovelRateCardSummary
  manga_rates: MangaRateCardSummary
}

export function useEditorSummariesMerge(summariesRef: Ref<EntitySummaries>) {
  function mergeEntity<K extends keyof EntitySummaryByKey>(
    key: K,
    item: EntitySummaryByKey[K],
  ): void {
    const list = summariesRef.value[key] as EntitySummaryByKey[K][]
    const next = list.filter(x => x.id !== item.id)
    next.push(item)
    summariesRef.value = { ...summariesRef.value, [key]: next }
  }

  function mergeMentionUser(item: MentionUserSummary): void {
    const list = summariesRef.value.mention_users
    const next = list.filter(x => x.id !== item.id)
    next.push(item)
    summariesRef.value = { ...summariesRef.value, mention_users: next }
  }

  return { mergeEntity, mergeMentionUser }
}
