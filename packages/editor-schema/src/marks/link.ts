import Link, { type LinkOptions } from '@tiptap/extension-link'
import { MARK_RENDER_SPECS } from '../render-protocol.js'

const LINK_SPEC = MARK_RENDER_SPECS.link

export const LinkMark = Link.extend({
  addOptions(): LinkOptions {
    const base = this.parent?.()
    return {
      ...base,
      openOnClick: false,
      autolink: false,
      defaultProtocol: 'https',
      protocols: ['https'],
      HTMLAttributes: {
        class: LINK_SPEC.class,
        ...LINK_SPEC.attrs,
      },
    } as LinkOptions
  },
})
