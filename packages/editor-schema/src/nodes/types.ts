export interface EditorDocument {
  type: 'doc'
  content?: EditorNode[]
}

export interface EditorNode {
  type: string
  attrs?: Record<string, unknown>
  content?: EditorNode[]
  text?: string
  marks?: EditorMark[]
}

export interface EditorMark {
  type: string
  attrs?: Record<string, unknown>
}

export interface ImageBlockAttrs {
  media_asset_id: number
  src: string
  alt: string | null
  caption: string | null
  width: number
  height: number
  width_percent: number
}

export interface MentionUserAttrs {
  mention_user_id: number
}

export interface EmojiInlineAttrs {
  emoji_code: string
}

export interface PollNodeAttrs {
  poll_key: string
  question: string
  options: string[]
  allow_multiple: boolean
  max_choices: number | null
  anonymous: boolean
  allow_change: boolean
  closes_at: string | null
}

export interface GalgameCardAttrs {
  galgame_id: number
}

export interface LightNovelCardAttrs {
  light_novel_id: number
}

export interface LightNovelVolumeCardAttrs {
  light_novel_volume_id: number
}

export interface MangaCardAttrs {
  manga_id: number
}

export interface PersonCardAttrs {
  person_id: number
}

export interface ProducerCardAttrs {
  producer_id: number
}

export interface CharacterCardAttrs {
  character_id: number
}

export interface ArticleCardAttrs {
  article_id: number
}

export interface PostCardAttrs {
  post_id: number
}

export interface GalgameRateCardAttrs {
  galgame_rate_id: number
}

export interface LightNovelRateCardAttrs {
  light_novel_rate_id: number
}

export interface MangaRateCardAttrs {
  manga_rate_id: number
}

export interface CommentCardAttrs {
  comment_id: number
}

export type EntityCardAttrs =
  | GalgameCardAttrs
  | LightNovelCardAttrs
  | LightNovelVolumeCardAttrs
  | MangaCardAttrs
  | PersonCardAttrs
  | ProducerCardAttrs
  | CharacterCardAttrs
  | ArticleCardAttrs
  | PostCardAttrs
  | GalgameRateCardAttrs
  | LightNovelRateCardAttrs
  | MangaRateCardAttrs
  | CommentCardAttrs

export type { EntityCardNodeType } from '../render-protocol.js'
