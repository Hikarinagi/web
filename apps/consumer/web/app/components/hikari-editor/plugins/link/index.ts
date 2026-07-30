import { Link2 } from '@lucide/vue'
import { LinkMark } from '@hikarinagi/editor-schema'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { useEditorOverlays } from '../../composables/useEditorOverlays'
import type { EditorPlugin } from '../types'
import { getSelectionAnchor, readLinkContext } from './helpers'
import LinkForm from './LinkForm.vue'

const ClickableLink = LinkMark.extend({
  inclusive: false,
  addProseMirrorPlugins() {
    const parentPlugins = this.parent?.() ?? []
    const editor = this.editor
    return [
      ...parentPlugins,
      new Plugin({
        key: new PluginKey('link_click_to_edit'),
        props: {
          handleClick(view, pos, event) {
            const target = event.target as HTMLElement | null
            const anchorEl = target?.closest('a')
            if (!anchorEl) return false
            const $pos = view.state.doc.resolve(pos)
            const linkMark = $pos.marks().find(m => m.type.name === 'link')
            if (!linkMark) return false
            const href = linkMark.attrs.href as string
            if (event.metaKey || event.ctrlKey) {
              window.open(href, '_blank', 'noopener,noreferrer')
              return true
            }
            editor.chain().setTextSelection(pos).extendMarkRange('link').run()
            const { selectedText } = readLinkContext(editor)
            useEditorOverlays().openOverlay('link', anchorEl, {
              editor,
              initialUrl: href,
              selectedText,
            })
            return true
          },
        },
      }),
    ]
  },
})

export const link: EditorPlugin = {
  id: 'link',
  group: 'insert-link',
  order: 0,
  extensions: () => [
    // 不 override HTMLAttributes: 继承 schema LinkMark 的 class / rel,
    // 与详情页 display 输出对齐 (WYSIWYG)。autolink/linkOnPaste 仅是编辑期 UX。
    ClickableLink.configure({
      autolink: true,
      linkOnPaste: true,
    }),
  ],
  toolbarItem: {
    icon: Link2,
    tooltip: '插入链接',
    isActive: editor => editor.isActive('link'),
    onClick: (editor, ctx) => {
      ctx.openOverlay('link', getSelectionAnchor(editor), {
        editor,
        ...readLinkContext(editor),
      })
    },
  },
  overlays: {
    link: LinkForm,
  },
}
