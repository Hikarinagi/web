import { Extension } from '@tiptap/core'
import { TEXT_ALIGN_VALUES } from '../render-protocol.js'

const ALIGN_NODE_TYPES = ['paragraph', 'heading']
const ALIGN_VALUES = TEXT_ALIGN_VALUES as readonly string[]

// text_align:挂在 paragraph/heading 上的全局节点属性(snake 命名)。不引
// @tiptap/extension-text-align(v3 未安装),自定义全局属性即可。left=默认不存。
export const TextAlignExtension = Extension.create({
  name: 'text_align',

  addGlobalAttributes() {
    return [
      {
        types: ALIGN_NODE_TYPES,
        attributes: {
          text_align: {
            default: null,
            parseHTML: el => {
              const a = (el as HTMLElement).style.textAlign
              return a && a !== 'left' && ALIGN_VALUES.includes(a) ? a : null
            },
            renderHTML: attrs =>
              attrs.text_align ? { style: `text-align: ${attrs.text_align}` } : {},
          },
        },
      },
    ]
  },
})
