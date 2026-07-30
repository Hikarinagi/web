import { Node, mergeAttributes } from '@tiptap/core'
import type { RenderedCardType, RenderedClassName } from '../render-protocol.js'
import type { MentionUserAttrs } from './types.js'

const CLASS_NAME = 'hikari-content-mention-user' satisfies RenderedClassName
const CARD_TYPE = 'mention_user' satisfies RenderedCardType

export const MentionUserExtension = Node.create({
  name: 'mention_user',
  group: 'inline',
  inline: true,
  atom: true,
  selectable: false,

  addAttributes() {
    return {
      mention_user_id: { default: null },
    }
  },

  parseHTML() {
    return [{ tag: `span[data-card-type="${CARD_TYPE}"]` }]
  },

  renderHTML({ node }) {
    const a = node.attrs as MentionUserAttrs
    return [
      'span',
      mergeAttributes({
        class: CLASS_NAME,
        'data-card-type': CARD_TYPE,
        'data-mention-user-id': String(a.mention_user_id ?? ''),
      }),
    ]
  },
})
