import type { EditorNode } from '../nodes/types.js'
import { SAFE_INTERNAL_LINK_REGEX } from '../render-protocol.js'

export interface NodeVisit {
  node: EditorNode
  path: (string | number)[]
}

export function* walkNodes(root: EditorNode): Generator<NodeVisit> {
  yield* walkInternal(root, [])
}

function* walkInternal(node: EditorNode, path: (string | number)[]): Generator<NodeVisit> {
  yield { node, path }
  if (Array.isArray(node.content)) {
    for (let i = 0; i < node.content.length; i++) {
      const child = node.content[i]
      yield* walkInternal(child!, [...path, 'content', i])
    }
  }
}

export function countCodePoints(text: string): number {
  let count = 0
  for (const _ of text) count++
  return count
}

export function byteLengthUtf8(value: string): number {
  return Buffer.byteLength(value, 'utf8')
}

// emoji set name: 2-16 chars; emoji name: 1-32 chars. 各允许 letters(含 CJK)/numbers/_/-。
// 禁空格/控制字符/标点/HTML 元字符,防 tooltip 注入和路径攻击。
export const EMOJI_CODE_REGEX = /^[\p{L}\p{N}_-]{2,16}:[\p{L}\p{N}_-]{1,32}$/u

export function isAllowedHref(href: unknown): boolean {
  if (typeof href !== 'string' || href.length === 0) return false
  if (href.startsWith('https://')) return true
  return SAFE_INTERNAL_LINK_REGEX.test(href)
}
