import type { AnyExtension } from '@tiptap/core'

export type EditorPresetKey = 'article' | 'post' | 'comment' | 'notification' | 'private_message'

export interface PresetLimits {
  max_json_bytes: number
  max_plain_text_chars: number
  max_image_nodes: number
  max_embed_nodes: number
  max_entity_card_nodes: number
  max_mention_user_nodes: number
  max_poll_nodes: number
  max_table_nodes: number
}

export interface PresetDefinition {
  key: EditorPresetKey
  extensions: AnyExtension[]
  allowed_node_types: ReadonlySet<string>
  allowed_mark_types: ReadonlySet<string>
  allowed_top_level_nodes: ReadonlySet<string>
  limits: PresetLimits
  css_scope_class: string
}
