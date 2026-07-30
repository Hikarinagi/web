export const ENTITY_CARD_SPECS = [
  { nodeName: 'galgame_card', idKey: 'galgame_id', dataCardType: 'galgame' },
  { nodeName: 'light_novel_card', idKey: 'light_novel_id', dataCardType: 'light_novel' },
  {
    nodeName: 'light_novel_volume_card',
    idKey: 'light_novel_volume_id',
    dataCardType: 'light_novel_volume',
  },
  { nodeName: 'manga_card', idKey: 'manga_id', dataCardType: 'manga' },
  { nodeName: 'person_card', idKey: 'person_id', dataCardType: 'person' },
  { nodeName: 'producer_card', idKey: 'producer_id', dataCardType: 'producer' },
  { nodeName: 'character_card', idKey: 'character_id', dataCardType: 'character' },
  { nodeName: 'article_card', idKey: 'article_id', dataCardType: 'article' },
  { nodeName: 'post_card', idKey: 'post_id', dataCardType: 'post' },
  { nodeName: 'galgame_rate_card', idKey: 'galgame_rate_id', dataCardType: 'galgame_rate' },
  {
    nodeName: 'light_novel_rate_card',
    idKey: 'light_novel_rate_id',
    dataCardType: 'light_novel_rate',
  },
  { nodeName: 'manga_rate_card', idKey: 'manga_rate_id', dataCardType: 'manga_rate' },
  { nodeName: 'comment_card', idKey: 'comment_id', dataCardType: 'comment' },
] as const

export type EntityCardSpec = (typeof ENTITY_CARD_SPECS)[number]
export type EntityCardNodeType = EntityCardSpec['nodeName']
export type EntityCardIdKey = EntityCardSpec['idKey']
export type EntityCardDataCardType = EntityCardSpec['dataCardType']

type SnakeToKebab<S extends string> = S extends `${infer A}_${infer B}`
  ? `${A}-${SnakeToKebab<B>}`
  : S

export type EntityCardDataAttr = `data-${SnakeToKebab<EntityCardIdKey>}`

export function entityCardDataAttr(idKey: EntityCardIdKey): EntityCardDataAttr {
  return `data-${idKey.replace(/_/g, '-')}` as EntityCardDataAttr
}

export const RENDERER_OUTPUT_CLASSES = [
  'hikari-content-image',
  'hikari-content-entity-card',
  'hikari-content-mention-user',
  'hikari-content-emoji',
  'hikari-content-link',
  'hikari-content-poll',
] as const

export type RenderedClassName = (typeof RENDERER_OUTPUT_CLASSES)[number]

const STANDALONE_CARD_TYPES = ['image', 'mention_user', 'emoji', 'poll'] as const

export type RenderedCardType = (typeof STANDALONE_CARD_TYPES)[number] | EntityCardDataCardType

export const RENDERED_CARD_TYPES: readonly RenderedCardType[] = [
  ...STANDALONE_CARD_TYPES,
  ...ENTITY_CARD_SPECS.map(s => s.dataCardType),
]

const STANDALONE_DATA_ATTRS = [
  'data-card-type',
  'data-media-asset-id',
  'data-media-src',
  'data-mention-user-id',
  'data-emoji-code',
  'data-poll-key',
] as const

export type RenderedDataAttr = (typeof STANDALONE_DATA_ATTRS)[number] | EntityCardDataAttr

export const RENDERER_OUTPUT_DATA_ATTRS: readonly RenderedDataAttr[] = [
  ...STANDALONE_DATA_ATTRS,
  ...ENTITY_CARD_SPECS.map(s => entityCardDataAttr(s.idKey)),
]

export const SAFE_INTERNAL_LINK_REGEX =
  /^\/(?:articles|posts|galgames|light-novels|light-novel-volumes|mangas|manga-volumes|people|producers|characters|tags|users|sections|topics)(?:\/|$|\?|#)/i

export const ALLOWED_LINK_URI_REGEXP =
  /^(?:https:\/\/|\/(?:articles|posts|galgames|light-novels|light-novel-volumes|mangas|manga-volumes|people|producers|characters|tags|users|sections|topics))/i

export const FORBIDDEN_MEDIA_SRC_SCHEME_REGEX = /^(?:javascript|data|vbscript|file):/i

// 安全的内联颜色:hex / rgb(a) / 命名色。拒 var() / url() / 表达式 等含括号或元字符的注入向量
// (rgb(a) 括号内只允许数字 . , % 空白 /)。text_style mark 与回填共用,作为 color 的唯一闸口。
export const SAFE_CSS_COLOR_REGEX =
  /^(?:#(?:[0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})|rgba?\(\s*[\d.,%\s/]+\)|[a-z]{3,20})$/i

export const TEXT_ALIGN_VALUES = ['left', 'center', 'right', 'justify'] as const
export type TextAlignValue = (typeof TEXT_ALIGN_VALUES)[number]

/**
 * 单一来源:每个 mark 在 sanitized HTML 中的渲染契约 (tag + class + 固定 attrs)。
 * editor LinkMark 与 display Text marks 都从这里 import,保证编辑器与详情页输出一致。
 */
export const MARK_RENDER_SPECS = {
  bold: { tag: 'strong', class: null, attrs: {} },
  italic: { tag: 'em', class: null, attrs: {} },
  strike: { tag: 's', class: null, attrs: {} },
  code: { tag: 'code', class: null, attrs: {} },
  link: {
    tag: 'a',
    class: 'hikari-content-link',
    attrs: { rel: 'noopener noreferrer ugc' },
  },
} as const satisfies Record<
  'bold' | 'italic' | 'strike' | 'code' | 'link',
  { tag: string; class: RenderedClassName | null; attrs: Record<string, string> }
>

export type MarkRenderSpec = (typeof MARK_RENDER_SPECS)[keyof typeof MARK_RENDER_SPECS]
