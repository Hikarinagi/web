import Document from '@tiptap/extension-document'
import HardBreak from '@tiptap/extension-hard-break'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { ENTITY_CARD_EXTENSIONS } from '../nodes/index.js'
import type { PresetDefinition } from './types.js'

const NOTIFICATION_CARD_NODES = [
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
  'comment_card',
]

const NOTIFICATION_NODES = ['doc', 'paragraph', 'text', 'hard_break', ...NOTIFICATION_CARD_NODES]

const NOTIFICATION_TOP_LEVEL_NODES = ['paragraph', ...NOTIFICATION_CARD_NODES]

export const NOTIFICATION_PRESET: PresetDefinition = {
  key: 'notification',
  extensions: [Document, Paragraph, Text, HardBreak, ...ENTITY_CARD_EXTENSIONS],
  allowed_node_types: new Set(NOTIFICATION_NODES),
  allowed_mark_types: new Set<string>(),
  allowed_top_level_nodes: new Set(NOTIFICATION_TOP_LEVEL_NODES),
  limits: {
    max_json_bytes: 16384,
    max_plain_text_chars: 2000,
    max_image_nodes: 0,
    max_embed_nodes: 0,
    max_entity_card_nodes: 8,
    max_mention_user_nodes: 0,
    max_poll_nodes: 0,
    max_table_nodes: 0,
  },
  css_scope_class: 'hikari-content--notification',
}
