export { EDITOR_SCHEMA_VERSION } from './version.js'

export {
  ENTITY_CARD_SPECS,
  RENDERER_OUTPUT_CLASSES,
  RENDERER_OUTPUT_DATA_ATTRS,
  RENDERED_CARD_TYPES,
  SAFE_INTERNAL_LINK_REGEX,
  ALLOWED_LINK_URI_REGEXP,
  FORBIDDEN_MEDIA_SRC_SCHEME_REGEX,
  MARK_RENDER_SPECS,
  SAFE_CSS_COLOR_REGEX,
  TEXT_ALIGN_VALUES,
  entityCardDataAttr,
} from './render-protocol.js'
export type {
  EntityCardSpec,
  EntityCardIdKey,
  EntityCardDataCardType,
  EntityCardDataAttr,
  RenderedClassName,
  RenderedCardType,
  RenderedDataAttr,
  MarkRenderSpec,
  TextAlignValue,
} from './render-protocol.js'

export type { EditorPresetKey, PresetDefinition, PresetLimits } from './presets/types.js'
export {
  ARTICLE_PRESET,
  POST_PRESET,
  COMMENT_PRESET,
  NOTIFICATION_PRESET,
  PRIVATE_MESSAGE_PRESET,
} from './presets/index.js'

export type {
  EditorDocument,
  EditorNode,
  EditorMark,
  ImageBlockAttrs,
  MentionUserAttrs,
  EmojiInlineAttrs,
  GalgameCardAttrs,
  LightNovelCardAttrs,
  LightNovelVolumeCardAttrs,
  MangaCardAttrs,
  PersonCardAttrs,
  ProducerCardAttrs,
  CharacterCardAttrs,
  ArticleCardAttrs,
  PostCardAttrs,
  GalgameRateCardAttrs,
  LightNovelRateCardAttrs,
  MangaRateCardAttrs,
  CommentCardAttrs,
  PollNodeAttrs,
  TableCellAttrs,
  TableCellAlign,
  TableCellNodeType,
  TableNodeType,
  EntityCardAttrs,
  EntityCardNodeType,
} from './nodes/types.js'

export {
  ImageBlockExtension,
  MentionUserExtension,
  EmojiInlineExtension,
  PollExtension,
  TextAlignExtension,
  TableExtension,
  TableRowExtension,
  TableHeaderExtension,
  TableCellExtension,
  TABLE_EXTENSIONS,
  TABLE_NODE_TYPES,
  TABLE_CELL_NODE_TYPES,
  TABLE_CELL_ALIGN_VALUES,
  TABLE_CELL_MIN_WIDTH,
  GalgameCardExtension,
  LightNovelCardExtension,
  LightNovelVolumeCardExtension,
  MangaCardExtension,
  PersonCardExtension,
  ProducerCardExtension,
  CharacterCardExtension,
  ArticleCardExtension,
  PostCardExtension,
  GalgameRateCardExtension,
  LightNovelRateCardExtension,
  MangaRateCardExtension,
  CommentCardExtension,
  ENTITY_CARD_EXTENSIONS,
  ENTITY_CARD_NODE_TYPES,
  ENTITY_CARD_ID_KEY,
} from './nodes/index.js'

export { LinkMark, SpoilerMark, TextStyleMark, sanitizeCssColor } from './marks/index.js'

export { validateDocument } from './validation/validate.js'
export type { ValidationIssue, ValidationIssueCode, ValidationResult } from './validation/types.js'
