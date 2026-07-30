import { Baseline } from '@lucide/vue'
import { TextStyleMark } from '@hikarinagi/editor-schema'
import type { EditorPlugin } from './types'
import ColorPalette from './text-color/ColorPalette.vue'

export const textColor: EditorPlugin = {
  id: 'text-color',
  group: 'format-inline',
  order: 5,
  extensions: () => [TextStyleMark],
  toolbarItem: {
    icon: Baseline,
    tooltip: '文字颜色',
    isActive: editor => editor.isActive('text_style'),
    onClick: (editor, ctx, trigger) => {
      ctx.openOverlay('text-color', trigger, { editor })
    },
  },
  overlays: {
    'text-color': ColorPalette,
  },
}
