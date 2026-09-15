import { ref, shallowRef } from 'vue'
import type { Editor, Range } from '@tiptap/core'
import type { OverlayAnchor } from '@hina-ui/vue'
import type { EditorPluginContext } from '../../types'
import type { CommandMenuItem } from '../types'

export interface CommandMenuState {
  active: boolean
  query: string
  range: Range | null
  items: CommandMenuItem[]
}

interface CommandMenuSession {
  ownerId: symbol
  editor: Editor
  pluginContext: EditorPluginContext
  query: string
  range: Range
  items: CommandMenuItem[]
  anchor: OverlayAnchor
}

const session = shallowRef<CommandMenuSession | null>(null)
const highlighted = ref(0)

function anchorFor(editor: Editor, range: () => Range): OverlayAnchor {
  return {
    contextElement: editor.view.dom,
    getBoundingClientRect: () => {
      const coords = editor.view.coordsAtPos(range().to)
      return new DOMRect(coords.left, coords.top, 0, Math.max(1, coords.bottom - coords.top))
    },
  }
}

export function useCommandMenu() {
  function show(next: Omit<CommandMenuSession, 'anchor'>) {
    const current = session.value
    if (current?.editor === next.editor) {
      session.value = { ...next, anchor: current.anchor }
      if (highlighted.value >= next.items.length) highlighted.value = 0
      return
    }
    highlighted.value = 0
    session.value = {
      ...next,
      anchor: anchorFor(next.editor, () => session.value?.range ?? next.range),
    }
  }

  function hide(editor?: Editor) {
    if (editor && session.value?.editor !== editor) return
    session.value = null
  }

  function move(delta: number) {
    const items = session.value?.items ?? []
    if (!items.length) return false
    highlighted.value = (highlighted.value + delta + items.length) % items.length
    return true
  }

  function commit(index = highlighted.value) {
    const current = session.value
    const item = current?.items[index]
    if (!current || !item) return false
    void item.action({
      editor: current.editor,
      range: current.range,
      pluginContext: current.pluginContext,
    })
    return true
  }

  return { session, highlighted, show, hide, move, commit }
}
