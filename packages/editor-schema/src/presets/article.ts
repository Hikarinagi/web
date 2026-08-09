import StarterKit from '@tiptap/starter-kit'
import { LinkMark } from '../marks/link.js'
import { SpoilerMark } from '../marks/spoiler.js'
import { TextStyleMark } from '../marks/text-style.js'
import {
  ENTITY_CARD_EXTENSIONS,
  EmojiInlineExtension,
  ImageBlockExtension,
  MentionUserExtension,
  PollExtension,
  TABLE_EXTENSIONS,
  TextAlignExtension,
} from '../nodes/index.js'
import type { PresetDefinition } from './types.js'

const ARTICLE_NODES = [
  'doc',
  'paragraph',
  'heading',
  'bullet_list',
  'ordered_list',
  'list_item',
  'blockquote',
  'code_block',
  'horizontal_rule',
  'hard_break',
  'text',
  'image_block',
  'mention_user',
  'emoji_inline',
  'poll',
  'table',
  'table_row',
  'table_header',
  'table_cell',
  'galgame_card',
  'light_novel_card',
  'light_novel_volume_card',
  'manga_card',
  'person_card',
  'producer_card',
  'character_card',
  'article_card',
  'post_card',
  'galgame_rate_card',
  'light_novel_rate_card',
  'manga_rate_card',
]

const ARTICLE_MARKS = ['bold', 'italic', 'strike', 'code', 'link', 'text_style', 'spoiler']

const ARTICLE_TOP_LEVEL_NODES = [
  'paragraph',
  'heading',
  'bullet_list',
  'ordered_list',
  'blockquote',
  'code_block',
  'horizontal_rule',
  'image_block',
  'poll',
  'table',
  'galgame_card',
  'light_novel_card',
  'light_novel_volume_card',
  'manga_card',
  'person_card',
  'producer_card',
  'character_card',
  'article_card',
  'post_card',
  'galgame_rate_card',
  'light_novel_rate_card',
  'manga_rate_card',
]

export const ARTICLE_PRESET: PresetDefinition = {
  key: 'article',
  extensions: [
    StarterKit.configure({
      heading: { levels: [2, 3, 4] },
      link: false,
    }),
    LinkMark,
    TextStyleMark,
    SpoilerMark,
    TextAlignExtension,
    ImageBlockExtension,
    MentionUserExtension,
    EmojiInlineExtension,
    PollExtension,
    ...TABLE_EXTENSIONS,
    ...ENTITY_CARD_EXTENSIONS,
  ],
  allowed_node_types: new Set(ARTICLE_NODES),
  allowed_mark_types: new Set(ARTICLE_MARKS),
  allowed_top_level_nodes: new Set(ARTICLE_TOP_LEVEL_NODES),
  limits: {
    max_json_bytes: 524288,
    max_plain_text_chars: 80000,
    max_image_nodes: 80,
    max_embed_nodes: 0,
    max_entity_card_nodes: 30,
    max_mention_user_nodes: 50,
    max_poll_nodes: 5,
    max_table_nodes: 20,
  },
  css_scope_class: 'hikari-content--article',
}
