import { Node, mergeAttributes } from '@tiptap/core'
import type { RenderedCardType, RenderedClassName } from '../render-protocol.js'
import type { ImageBlockAttrs } from './types.js'

const CLASS_NAME = 'hikari-content-image' satisfies RenderedClassName
const CARD_TYPE = 'image' satisfies RenderedCardType

export const ImageBlockExtension = Node.create({
  name: 'image_block',
  group: 'block',
  atom: true,
  draggable: true,
  selectable: true,

  addAttributes() {
    return {
      media_asset_id: { default: null },
      src: { default: '' },
      alt: { default: null },
      caption: { default: null },
      width: { default: 0 },
      height: { default: 0 },
      width_percent: { default: 100 },
    }
  },

  parseHTML() {
    return [{ tag: `figure[data-card-type="${CARD_TYPE}"]` }]
  },

  renderHTML({ node }) {
    const a = node.attrs as ImageBlockAttrs
    const figureAttrs = mergeAttributes({
      class: CLASS_NAME,
      'data-card-type': CARD_TYPE,
      'data-media-asset-id': String(a.media_asset_id ?? ''),
    })
    const imgAttrs: Record<string, string> = {
      'data-media-src': a.src ?? '',
      alt: a.alt ?? '',
    }
    if (a.width) imgAttrs.width = String(a.width)
    if (a.height) imgAttrs.height = String(a.height)
    const children: (string | [string, Record<string, unknown>, ...unknown[]])[] = [
      ['img', imgAttrs],
    ]
    if (a.caption) {
      children.push(['figcaption', {}, a.caption])
    }
    return ['figure', figureAttrs, ...children] as unknown as [
      string,
      Record<string, unknown>,
      ...unknown[],
    ]
  },
})
