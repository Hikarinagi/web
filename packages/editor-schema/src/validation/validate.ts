import { ENTITY_CARD_ID_KEY, ENTITY_CARD_NODE_TYPES } from '../nodes/entity-card.js'
import type { EditorDocument, EditorMark, EditorNode } from '../nodes/types.js'
import type { PresetDefinition } from '../presets/types.js'
import {
  FORBIDDEN_MEDIA_SRC_SCHEME_REGEX,
  SAFE_CSS_COLOR_REGEX,
  TEXT_ALIGN_VALUES,
} from '../render-protocol.js'
import { checkLimits, countLimits } from './limits.js'
import type { ValidationIssue, ValidationResult } from './types.js'
import { EMOJI_CODE_REGEX, isAllowedHref } from './walkers.js'

export function validateDocument(input: unknown, preset: PresetDefinition): ValidationResult {
  const issues: ValidationIssue[] = []

  if (!isObject(input) || (input as { type?: unknown }).type !== 'doc') {
    issues.push({
      path: [],
      code: 'document_not_doc_root',
      message: '文档根节点必须是 doc',
    })
    return { ok: false, issues }
  }

  const doc = input as unknown as EditorDocument

  if (Array.isArray(doc.content)) {
    for (let i = 0; i < doc.content.length; i++) {
      const child = doc.content[i]!
      const childPath: (string | number)[] = ['content', i]
      if (!preset.allowed_top_level_nodes.has(child.type)) {
        issues.push({
          path: childPath,
          code: 'forbidden_top_level_node',
          message: `顶层节点 ${child.type} 不被当前 preset 允许`,
        })
      }
      validateNode(child, childPath, preset, issues)
    }
  }

  const counters = countLimits(doc, doc as EditorNode)
  issues.push(...checkLimits(counters, preset.limits))

  return { ok: issues.length === 0, issues }
}

function validateNode(
  node: EditorNode,
  path: (string | number)[],
  preset: PresetDefinition,
  issues: ValidationIssue[],
): void {
  if (!preset.allowed_node_types.has(node.type)) {
    issues.push({
      path,
      code: 'unknown_node',
      message: `不支持的节点类型: ${node.type}`,
    })
    return
  }

  validateNodeAttrs(node, path, issues)

  if (Array.isArray(node.marks)) {
    for (let i = 0; i < node.marks.length; i++) {
      const mark = node.marks[i]!
      validateMark(mark, [...path, 'marks', i], preset, issues)
    }
  }

  if (Array.isArray(node.content)) {
    for (let i = 0; i < node.content.length; i++) {
      validateNode(node.content[i]!, [...path, 'content', i], preset, issues)
    }
  }
}

function validateMark(
  mark: EditorMark,
  path: (string | number)[],
  preset: PresetDefinition,
  issues: ValidationIssue[],
): void {
  if (!preset.allowed_mark_types.has(mark.type)) {
    issues.push({
      path,
      code: 'unknown_mark',
      message: `不支持的 mark 类型: ${mark.type}`,
    })
    return
  }
  if (mark.type === 'link') {
    const href = mark.attrs?.href
    if (!isAllowedHref(href)) {
      issues.push({
        path: [...path, 'attrs', 'href'],
        code: 'invalid_url_scheme',
        message: '链接必须使用 https:// 或站内绝对路径',
      })
    }
  }
  if (mark.type === 'text_style') {
    const color = mark.attrs?.color
    if (color != null && (typeof color !== 'string' || !SAFE_CSS_COLOR_REGEX.test(color))) {
      issues.push({
        path: [...path, 'attrs', 'color'],
        code: 'invalid_attr_type',
        message: 'color 必须是安全颜色值 (hex / rgb(a) / 命名色)',
      })
    }
  }
}

function validateNodeAttrs(
  node: EditorNode,
  path: (string | number)[],
  issues: ValidationIssue[],
): void {
  switch (node.type) {
    case 'image_block':
      return validateImageBlockAttrs(node, path, issues)
    case 'mention_user':
      return validateRequiredIntAttr(node, path, 'mention_user_id', issues)
    case 'emoji_inline':
      return validateEmojiInlineAttrs(node, path, issues)
    case 'poll':
      return validatePollAttrs(node, path, issues)
    case 'paragraph':
    case 'heading':
      return validateTextAlignAttr(node, path, issues)
    default:
      if (ENTITY_CARD_NODE_TYPES.has(node.type as never)) {
        const idKey = ENTITY_CARD_ID_KEY[node.type as keyof typeof ENTITY_CARD_ID_KEY]
        validateRequiredIntAttr(node, path, idKey, issues)
      }
      return
  }
}

function validateImageBlockAttrs(
  node: EditorNode,
  path: (string | number)[],
  issues: ValidationIssue[],
): void {
  const attrs = node.attrs ?? {}
  const attrsPath = [...path, 'attrs']

  if (!isPositiveInteger(attrs.media_asset_id)) {
    issues.push({
      path: [...attrsPath, 'media_asset_id'],
      code: 'invalid_attr_type',
      message: 'media_asset_id 必须是正整数',
    })
  }
  if (typeof attrs.src !== 'string' || attrs.src.length === 0) {
    issues.push({
      path: [...attrsPath, 'src'],
      code: 'missing_required_attr',
      message: 'src 不能为空',
    })
  } else if (FORBIDDEN_MEDIA_SRC_SCHEME_REGEX.test(attrs.src)) {
    issues.push({
      path: [...attrsPath, 'src'],
      code: 'invalid_media_src_scheme',
      message: 'src 不允许使用 javascript: / data: / vbscript: / file: 协议',
    })
  }
  if (attrs.alt != null && typeof attrs.alt !== 'string') {
    issues.push({
      path: [...attrsPath, 'alt'],
      code: 'invalid_attr_type',
      message: 'alt 必须是 string 或 null',
    })
  }
  if (attrs.caption != null && typeof attrs.caption !== 'string') {
    issues.push({
      path: [...attrsPath, 'caption'],
      code: 'invalid_attr_type',
      message: 'caption 必须是 string 或 null',
    })
  }
  if (!isNonNegativeInteger(attrs.width)) {
    issues.push({
      path: [...attrsPath, 'width'],
      code: 'invalid_attr_type',
      message: 'width 必须是非负整数',
    })
  }
  if (!isNonNegativeInteger(attrs.height)) {
    issues.push({
      path: [...attrsPath, 'height'],
      code: 'invalid_attr_type',
      message: 'height 必须是非负整数',
    })
  }
}

function validateTextAlignAttr(
  node: EditorNode,
  path: (string | number)[],
  issues: ValidationIssue[],
): void {
  const align = node.attrs?.text_align
  if (align != null && !(TEXT_ALIGN_VALUES as readonly unknown[]).includes(align)) {
    issues.push({
      path: [...path, 'attrs', 'text_align'],
      code: 'invalid_attr_type',
      message: 'text_align 取值必须是 left / center / right / justify',
    })
  }
}

function validateEmojiInlineAttrs(
  node: EditorNode,
  path: (string | number)[],
  issues: ValidationIssue[],
): void {
  const code = node.attrs?.emoji_code
  if (typeof code !== 'string' || code.length === 0) {
    issues.push({
      path: [...path, 'attrs', 'emoji_code'],
      code: 'missing_required_attr',
      message: 'emoji_code 不能为空',
    })
    return
  }
  if (!EMOJI_CODE_REGEX.test(code)) {
    issues.push({
      path: [...path, 'attrs', 'emoji_code'],
      code: 'invalid_emoji_code',
      message: 'emoji_code 必须为 <set_name>:<emoji_name> 形态',
    })
  }
}

function validatePollAttrs(
  node: EditorNode,
  path: (string | number)[],
  issues: ValidationIssue[],
): void {
  const attrs = node.attrs ?? {}
  const attrsPath = [...path, 'attrs']

  if (
    typeof attrs.poll_key !== 'string' ||
    attrs.poll_key.length === 0 ||
    attrs.poll_key.length > 64
  ) {
    issues.push({
      path: [...attrsPath, 'poll_key'],
      code: 'missing_required_attr',
      message: 'poll_key 不能为空',
    })
  }
  if (
    typeof attrs.question !== 'string' ||
    attrs.question.trim().length === 0 ||
    attrs.question.length > 120
  ) {
    issues.push({
      path: [...attrsPath, 'question'],
      code: 'invalid_attr_type',
      message: 'question 必须是 1-120 字',
    })
  }
  if (!Array.isArray(attrs.options) || attrs.options.length < 2 || attrs.options.length > 10) {
    issues.push({
      path: [...attrsPath, 'options'],
      code: 'invalid_attr_type',
      message: 'options 必须是 2-10 项',
    })
  } else if (
    attrs.options.some(o => typeof o !== 'string' || o.trim().length === 0 || o.length > 80)
  ) {
    issues.push({
      path: [...attrsPath, 'options'],
      code: 'invalid_attr_type',
      message: '每个选项必须是 1-80 字',
    })
  }
  if (attrs.allow_multiple != null && typeof attrs.allow_multiple !== 'boolean') {
    issues.push({
      path: [...attrsPath, 'allow_multiple'],
      code: 'invalid_attr_type',
      message: 'allow_multiple 必须是布尔值',
    })
  }
  if (attrs.closes_at != null && typeof attrs.closes_at !== 'string') {
    issues.push({
      path: [...attrsPath, 'closes_at'],
      code: 'invalid_attr_type',
      message: 'closes_at 必须是字符串或 null',
    })
  }
  if (
    attrs.max_choices != null &&
    (!Number.isInteger(attrs.max_choices) ||
      (attrs.max_choices as number) < 2 ||
      (Array.isArray(attrs.options) && (attrs.max_choices as number) > attrs.options.length))
  ) {
    issues.push({
      path: [...attrsPath, 'max_choices'],
      code: 'invalid_attr_type',
      message: 'max_choices 必须是 2 到选项数之间的整数',
    })
  }
  if (attrs.anonymous != null && typeof attrs.anonymous !== 'boolean') {
    issues.push({
      path: [...attrsPath, 'anonymous'],
      code: 'invalid_attr_type',
      message: 'anonymous 必须是布尔值',
    })
  }
  if (attrs.allow_change != null && typeof attrs.allow_change !== 'boolean') {
    issues.push({
      path: [...attrsPath, 'allow_change'],
      code: 'invalid_attr_type',
      message: 'allow_change 必须是布尔值',
    })
  }
}

function validateRequiredIntAttr(
  node: EditorNode,
  path: (string | number)[],
  attrName: string,
  issues: ValidationIssue[],
): void {
  const value = node.attrs?.[attrName]
  if (value == null) {
    issues.push({
      path: [...path, 'attrs', attrName],
      code: 'missing_required_attr',
      message: `${attrName} 不能为空`,
    })
    return
  }
  if (!isPositiveInteger(value)) {
    issues.push({
      path: [...path, 'attrs', attrName],
      code: 'invalid_attr_type',
      message: `${attrName} 必须是正整数`,
    })
  }
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isPositiveInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value > 0
}

function isNonNegativeInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0
}
