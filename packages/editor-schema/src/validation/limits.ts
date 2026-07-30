import { ENTITY_CARD_NODE_TYPES } from '../nodes/entity-card.js'
import type { EditorNode } from '../nodes/types.js'
import type { PresetLimits } from '../presets/types.js'
import type { ValidationIssue } from './types.js'
import { byteLengthUtf8, countCodePoints, walkNodes } from './walkers.js'

export interface LimitCounters {
  json_bytes: number
  plain_text_chars: number
  image_nodes: number
  embed_nodes: number
  entity_card_nodes: number
  mention_user_nodes: number
  poll_nodes: number
}

export function countLimits(json: unknown, root: EditorNode): LimitCounters {
  let plainTextChars = 0
  let imageNodes = 0
  const embedNodes = 0
  let entityCardNodes = 0
  let mentionUserNodes = 0
  let pollNodes = 0

  for (const { node } of walkNodes(root)) {
    if (node.type === 'text' && typeof node.text === 'string') {
      plainTextChars += countCodePoints(node.text)
    }
    if (node.type === 'image_block') imageNodes++
    if (node.type === 'mention_user') {
      mentionUserNodes++
      plainTextChars += 1
    }
    if (node.type === 'emoji_inline') {
      plainTextChars += 1
    }
    if (node.type === 'poll') pollNodes++
    if (ENTITY_CARD_NODE_TYPES.has(node.type as never)) entityCardNodes++
  }

  return {
    json_bytes: byteLengthUtf8(JSON.stringify(json)),
    plain_text_chars: plainTextChars,
    image_nodes: imageNodes,
    embed_nodes: embedNodes,
    entity_card_nodes: entityCardNodes,
    mention_user_nodes: mentionUserNodes,
    poll_nodes: pollNodes,
  }
}

export function checkLimits(counters: LimitCounters, limits: PresetLimits): ValidationIssue[] {
  const issues: ValidationIssue[] = []
  if (counters.json_bytes > limits.max_json_bytes) {
    issues.push({
      path: [],
      code: 'limit_exceeded_json_bytes',
      message: `内容超出大小限制 (${counters.json_bytes} > ${limits.max_json_bytes} bytes)`,
    })
  }
  if (counters.plain_text_chars > limits.max_plain_text_chars) {
    issues.push({
      path: [],
      code: 'limit_exceeded_plain_text_chars',
      message: `正文字符数超出限制 (${counters.plain_text_chars} > ${limits.max_plain_text_chars})`,
    })
  }
  if (counters.image_nodes > limits.max_image_nodes) {
    issues.push({
      path: [],
      code: 'limit_exceeded_image_nodes',
      message: `图片数量超出限制 (${counters.image_nodes} > ${limits.max_image_nodes})`,
    })
  }
  if (counters.embed_nodes > limits.max_embed_nodes) {
    issues.push({
      path: [],
      code: 'limit_exceeded_embed_nodes',
      message: `外链嵌入数量超出限制 (${counters.embed_nodes} > ${limits.max_embed_nodes})`,
    })
  }
  if (counters.entity_card_nodes > limits.max_entity_card_nodes) {
    issues.push({
      path: [],
      code: 'limit_exceeded_entity_card_nodes',
      message: `实体卡片数量超出限制 (${counters.entity_card_nodes} > ${limits.max_entity_card_nodes})`,
    })
  }
  if (counters.mention_user_nodes > limits.max_mention_user_nodes) {
    issues.push({
      path: [],
      code: 'limit_exceeded_mention_user_nodes',
      message: `用户提及数量超出限制 (${counters.mention_user_nodes} > ${limits.max_mention_user_nodes})`,
    })
  }
  if (counters.poll_nodes > limits.max_poll_nodes) {
    issues.push({
      path: [],
      code: 'limit_exceeded_poll_nodes',
      message: `投票数量超出限制 (${counters.poll_nodes} > ${limits.max_poll_nodes})`,
    })
  }
  return issues
}
