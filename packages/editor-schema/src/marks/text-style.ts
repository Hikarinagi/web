import { Mark, mergeAttributes } from '@tiptap/core'
import { SAFE_CSS_COLOR_REGEX } from '../render-protocol.js'

export function sanitizeCssColor(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const v = value.trim()
  return v && SAFE_CSS_COLOR_REGEX.test(v) ? v : null
}

// text_style:只承载 color 的内联 mark(对齐 tiptap textStyle 心智,snake 命名同 hard_break)。
// 不引 @tiptap/extension-text-style/color(v3 未安装),最小自定义即可,且自己掌控 color 闸口。
export const TextStyleMark = Mark.create({
  name: 'text_style',

  addAttributes() {
    return {
      color: {
        default: null,
        parseHTML: el => sanitizeCssColor((el as HTMLElement).style.color),
        renderHTML: attrs => {
          const color = sanitizeCssColor(attrs.color)
          return color ? { style: `color: ${color}` } : {}
        },
      },
    }
  },

  parseHTML() {
    // 只对带合法颜色的 span 成 mark;无色 span 返 false(不匹配),避免空 text_style 噪声。
    return [
      {
        tag: 'span',
        getAttrs: el => (sanitizeCssColor((el as HTMLElement).style.color) ? {} : false),
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['span', mergeAttributes(HTMLAttributes), 0]
  },
})
