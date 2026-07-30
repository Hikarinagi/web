import Document from '@tiptap/extension-document'
import HardBreak from '@tiptap/extension-hard-break'
import History from '@tiptap/extension-history'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { LinkMark } from '../marks/link.js'
import { SpoilerMark } from '../marks/spoiler.js'
import {
  EmojiInlineExtension,
  GalgameCardExtension,
  LightNovelCardExtension,
  LightNovelVolumeCardExtension,
  MangaCardExtension,
  MentionUserExtension,
} from '../nodes/index.js'
import type { PresetDefinition } from './types.js'

const COMMENT_NODES = [
  'doc',
  'paragraph',
  'text',
  'hard_break',
  'mention_user',
  'emoji_inline',
  'galgame_card',
  'light_novel_card',
  'light_novel_volume_card',
  'manga_card',
]

const COMMENT_MARKS = ['link', 'spoiler']

const COMMENT_TOP_LEVEL_NODES = [
  'paragraph',
  'galgame_card',
  'light_novel_card',
  'light_novel_volume_card',
  'manga_card',
]

export const COMMENT_PRESET: PresetDefinition = {
  key: 'comment',
  extensions: [
    Document,
    Paragraph,
    Text,
    HardBreak,
    History,
    MentionUserExtension,
    EmojiInlineExtension,
    LinkMark,
    SpoilerMark,
    GalgameCardExtension,
    LightNovelCardExtension,
    LightNovelVolumeCardExtension,
    MangaCardExtension,
  ],
  allowed_node_types: new Set(COMMENT_NODES),
  allowed_mark_types: new Set(COMMENT_MARKS),
  allowed_top_level_nodes: new Set(COMMENT_TOP_LEVEL_NODES),
  limits: {
    max_json_bytes: 32768,
    max_plain_text_chars: 4000,
    max_image_nodes: 0,
    max_embed_nodes: 0,
    max_entity_card_nodes: 5,
    max_mention_user_nodes: 10,
    max_poll_nodes: 0,
  },
  css_scope_class: 'hikari-content--comment',
}
