import { Node, mergeAttributes } from '@tiptap/core'
import type { RenderedCardType, RenderedClassName } from '../render-protocol.js'
import type { EmojiInlineAttrs } from './types.js'

const CLASS_NAME = 'hikari-content-emoji' satisfies RenderedClassName
const CARD_TYPE = 'emoji' satisfies RenderedCardType

export const EmojiInlineExtension = Node.create({
  name: 'emoji_inline',
  group: 'inline',
  inline: true,
  atom: true,
  selectable: false,

  addAttributes() {
    return {
      emoji_code: { default: '' },
    }
  },

  parseHTML() {
    return [{ tag: `span[data-card-type="${CARD_TYPE}"]` }]
  },

  renderHTML({ node }) {
    const a = node.attrs as EmojiInlineAttrs
    return [
      'span',
      mergeAttributes({
        class: CLASS_NAME,
        'data-card-type': CARD_TYPE,
        'data-emoji-code': a.emoji_code ?? '',
      }),
    ]
  },
})
