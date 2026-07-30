export type ValidationIssueCode =
  | 'document_not_doc_root'
  | 'unknown_node'
  | 'unknown_mark'
  | 'forbidden_top_level_node'
  | 'forbidden_attr'
  | 'missing_required_attr'
  | 'invalid_attr_type'
  | 'invalid_url_scheme'
  | 'invalid_media_src_scheme'
  | 'invalid_emoji_code'
  | 'limit_exceeded_json_bytes'
  | 'limit_exceeded_plain_text_chars'
  | 'limit_exceeded_image_nodes'
  | 'limit_exceeded_embed_nodes'
  | 'limit_exceeded_entity_card_nodes'
  | 'limit_exceeded_mention_user_nodes'
  | 'limit_exceeded_poll_nodes'

export interface ValidationIssue {
  path: (string | number)[]
  code: ValidationIssueCode
  message: string
}

export interface ValidationResult {
  ok: boolean
  issues: ValidationIssue[]
}
