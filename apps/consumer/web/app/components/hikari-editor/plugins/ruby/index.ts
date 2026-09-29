import { Mark, mergeAttributes } from '@tiptap/core'
import { toast } from '@hina-ui/vue'
import { Superscript } from '@lucide/vue'
import { getSelectionAnchor } from '../link/helpers'
import type { EditorPlugin } from '../types'
import RubyForm from './RubyForm.vue'

const RubyMark = Mark.create({
  name: 'ruby',
  inclusive: false,
  excludes: 'emphasis',
  addAttributes() {
    return {
      reading: {
        default: '',
        parseHTML: element => element.getAttribute('data-ruby') ?? '',
        renderHTML: attributes => ({ 'data-ruby': attributes.reading }),
      },
    }
  },
  parseHTML() {
    return [{ tag: 'span[data-ruby]' }]
  },
  renderHTML({ HTMLAttributes }) {
    return [
      'span',
      mergeAttributes(HTMLAttributes, {
        class:
          'underline decoration-dotted underline-offset-4 after:ms-0.5 after:align-super after:text-xs after:text-muted after:content-[attr(data-ruby)]',
      }),
      0,
    ]
  },
})

export const ruby: EditorPlugin = {
  id: 'ruby',
  group: 'format-inline',
  order: 0,
  extensions: () => [RubyMark],
  toolbarItem: {
    icon: Superscript,
    tooltip: '注音',
    isActive: editor => editor.isActive('ruby'),
    onClick: (editor, ctx) => {
      const { from, to } = editor.state.selection
      const base = editor.state.doc.textBetween(from, to, '')
      if (!base || base.length > 50 || base.includes('\n')) {
        toast.warning('先选中一段不超过 50 字、不跨行的文字')
        return
      }
      ctx.openOverlay('ruby', getSelectionAnchor(editor), {
        editor,
        base,
        initialReading: (editor.getAttributes('ruby').reading as string | undefined) || undefined,
      })
    },
  },
  overlays: {
    ruby: RubyForm,
  },
}
