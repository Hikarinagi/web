import { Vote } from '@lucide/vue'
import { PollExtension } from '@hikarinagi/editor-schema'
import type { Editor } from '@tiptap/core'
import { VueNodeViewRenderer } from '@tiptap/vue-3'
import { usePollEditor } from '~/features/interaction/usePollEditor'
import { insertAfterTable } from '../table/insert'
import type { EditorPlugin } from '../types'
import PollEditorView from './PollEditorView.vue'

const PollNode = PollExtension.extend({
  addNodeView() {
    return VueNodeViewRenderer(PollEditorView)
  },
})

export function openPollInsert(editor: Editor) {
  usePollEditor().open({
    mode: 'create',
    onSave: def => {
      const content = [
        {
          type: 'poll',
          attrs: {
            poll_key: crypto.randomUUID(),
            question: def.question,
            options: def.options,
            allow_multiple: def.allow_multiple,
            max_choices: def.max_choices,
            anonymous: def.anonymous,
            allow_change: def.allow_change,
            closes_at: def.closes_at,
          },
        },
        { type: 'paragraph' },
      ]
      if (insertAfterTable(editor, content)) return
      editor.chain().focus().insertContent(content).run()
    },
  })
}

export const poll: EditorPlugin = {
  id: 'poll',
  group: 'insert-media',
  order: 2,
  extensions: () => [PollNode],
  toolbarItem: {
    icon: Vote,
    tooltip: '插入投票',
    onClick: editor => openPollInsert(editor),
  },
}
