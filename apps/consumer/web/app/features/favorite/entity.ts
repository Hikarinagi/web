export type FavoriteEntityType =
  | 'galgame'
  | 'light_novel'
  | 'manga'
  | 'article'
  | 'post'
  | 'section'
  | 'topic'

export const FAVORITE_SEG: Record<FavoriteEntityType, string> = {
  galgame: 'galgames',
  light_novel: 'lightnovels',
  manga: 'mangas',
  article: 'articles',
  post: 'posts',
  section: 'sections',
  topic: 'topics',
}

// Shared SSR-state key for "is this entity favorited in any collection".
// FavoriteToggle reads it; the picker composable writes it back on change.
export function favoriteStateKey(type: FavoriteEntityType, id: number) {
  return `fav:${type}:${id}`
}
