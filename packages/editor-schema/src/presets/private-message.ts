import Document from '@tiptap/extension-document'
import HardBreak from '@tiptap/extension-hard-break'
import History from '@tiptap/extension-history'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { EmojiInlineExtension } from '../nodes/index.js'
import type { PresetDefinition } from './types.js'

const PRIVATE_MESSAGE_NODES = ['doc', 'paragraph', 'text', 'hard_break', 'emoji_inline']

const PRIVATE_MESSAGE_TOP_LEVEL_NODES = ['paragraph']

export const PRIVATE_MESSAGE_PRESET: PresetDefinition = {
  key: 'private_message',
  extensions: [Document, Paragraph, Text, HardBreak, History, EmojiInlineExtension],
  allowed_node_types: new Set(PRIVATE_MESSAGE_NODES),
  allowed_mark_types: new Set<string>(),
  allowed_top_level_nodes: new Set(PRIVATE_MESSAGE_TOP_LEVEL_NODES),
  limits: {
    max_json_bytes: 16384,
    max_plain_text_chars: 2000,
    max_image_nodes: 0,
    max_embed_nodes: 0,
    max_entity_card_nodes: 0,
    max_mention_user_nodes: 0,
    max_poll_nodes: 0,
  },
  css_scope_class: 'hikari-content--private-message',
}
