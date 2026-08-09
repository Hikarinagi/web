import { blockquote } from './blockquote'
import { bold } from './bold'
import { bulletList } from './bullet-list'
import { code } from './code'
import { codeBlock } from './code-block'
import { command } from './command'
import { emoji } from './emoji'
import { entityCard } from './entity-card'
import { heading } from './heading'
import { horizontalRule } from './horizontal-rule'
import { image } from './image'
import { italic } from './italic'
import { link } from './link'
import { mention } from './mention'
import { orderedList } from './ordered-list'
import { poll } from './poll'
import { spoiler } from './spoiler'
import { strike } from './strike'
import { table } from './table'
import { textAlign } from './text-align'
import { textColor } from './text-color'
import type { EditorPlugin, EditorProfile, ToolbarGroup } from './types'

const COMMUNITY_PLUGINS: EditorPlugin[] = [
  command,
  bold,
  italic,
  strike,
  code,
  spoiler,
  textColor,
  heading,
  textAlign,
  bulletList,
  orderedList,
  blockquote,
  codeBlock,
  horizontalRule,
  link,
  image,
  entityCard,
  poll,
  table,
  emoji,
  mention,
]

const COMMENT_PLUGINS: EditorPlugin[] = [mention, emoji, link, spoiler, entityCard]

const PRIVATE_MESSAGE_PLUGINS: EditorPlugin[] = [emoji]

const POST_PLUGINS: EditorPlugin[] = [
  bold,
  italic,
  strike,
  code,
  spoiler,
  link,
  mention,
  emoji,
  entityCard,
]

const GROUP_ORDER: Record<ToolbarGroup, number> = {
  'format-inline': 0,
  'format-block': 1,
  'insert-link': 2,
  'insert-media': 3,
}

function byGroupOrder(a: EditorPlugin, b: EditorPlugin): number {
  const ga = a.group ? GROUP_ORDER[a.group] : 100
  const gb = b.group ? GROUP_ORDER[b.group] : 100
  if (ga !== gb) return ga - gb
  return a.order - b.order
}

export function useEditorPlugins(profile: EditorProfile): EditorPlugin[] {
  if (profile === 'community') return [...COMMUNITY_PLUGINS].sort(byGroupOrder)
  if (profile === 'comment') return [...COMMENT_PLUGINS].sort(byGroupOrder)
  if (profile === 'post') return [...POST_PLUGINS].sort(byGroupOrder)
  if (profile === 'private_message') return [...PRIVATE_MESSAGE_PLUGINS].sort(byGroupOrder)
  return []
}
