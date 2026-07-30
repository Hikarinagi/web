import { Node, mergeAttributes } from '@tiptap/core'
import type { RenderedCardType, RenderedClassName } from '../render-protocol.js'
import type { PollNodeAttrs } from './types.js'

const CLASS_NAME = 'hikari-content-poll' satisfies RenderedClassName
const CARD_TYPE = 'poll' satisfies RenderedCardType

export const PollExtension = Node.create({
  name: 'poll',
  group: 'block',
  atom: true,
  draggable: true,
  selectable: true,

  addAttributes() {
    return {
      poll_key: { default: null },
      question: { default: '' },
      options: { default: [] },
      allow_multiple: { default: false },
      max_choices: { default: null },
      anonymous: { default: true },
      allow_change: { default: true },
      closes_at: { default: null },
    }
  },

  parseHTML() {
    return [{ tag: `div[data-card-type="${CARD_TYPE}"]` }]
  },

  renderHTML({ node }) {
    const a = node.attrs as PollNodeAttrs
    return [
      'div',
      mergeAttributes({
        class: CLASS_NAME,
        'data-card-type': CARD_TYPE,
        'data-poll-key': String(a.poll_key ?? ''),
      }),
    ]
  },
})
