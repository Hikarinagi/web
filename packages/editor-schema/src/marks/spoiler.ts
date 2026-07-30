import { Mark, mergeAttributes } from '@tiptap/core'

export const SpoilerMark = Mark.create({
  name: 'spoiler',

  parseHTML() {
    return [{ tag: 'span.hikari-spoiler' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['span', mergeAttributes(HTMLAttributes, { class: 'hikari-spoiler' }), 0]
  },

  addKeyboardShortcuts() {
    return {
      'Mod-Shift-s': () => this.editor.commands.toggleMark(this.name),
    }
  },
})
