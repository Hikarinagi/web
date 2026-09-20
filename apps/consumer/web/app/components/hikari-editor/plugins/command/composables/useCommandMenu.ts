import { computePosition, flip, offset, shift, type VirtualElement } from '@floating-ui/dom'
import type { Editor, Range } from '@tiptap/core'
import type { EditorView } from '@tiptap/pm/view'
import { animate } from 'motion-v'
import { TRANSITION, TRANSITION_FAST } from '~/lib/motion'
import type { EditorPluginContext } from '../../types'
import { VueRenderer } from '@tiptap/vue-3'
import CommandMenu from '../Menu.vue'
import type { CommandMenuItem } from '../types'

export interface CommandMenuState {
  active: boolean
  query: string
  range: Range | null
  items: CommandMenuItem[]
}

interface CommandMenuExposed {
  onArrowDown: () => void
  onArrowUp: () => void
  onEnter: () => void
}

export interface CommandMenuRenderer {
  update: (state: CommandMenuState, view: EditorView) => void
  keydown: (event: KeyboardEvent) => boolean
  destroy: () => void
}

export function createCommandMenuRenderer(
  editor: Editor,
  pluginContext: EditorPluginContext,
): CommandMenuRenderer {
  let component: VueRenderer | null = null
  let popup: HTMLElement | null = null
  let current: CommandMenuState = { active: false, query: '', range: null, items: [] }
  let positioned = false
  let positionSeq = 0

  function command(item: CommandMenuItem) {
    const range = current.range
    if (!range) return
    void item.action({ editor, range, pluginContext })
  }

  function ensure(view: EditorView) {
    if (component && popup) return
    component = new VueRenderer(CommandMenu, {
      props: {
        items: current.items,
        query: current.query,
        command,
      },
      editor,
    })
    popup = document.createElement('div')
    popup.style.position = 'fixed'
    popup.style.left = '0'
    popup.style.top = '0'
    popup.style.zIndex = '11000'
    popup.style.transformOrigin = 'top left'
    popup.style.opacity = '0'
    popup.style.visibility = 'hidden'
    popup.style.willChange = 'transform, opacity'
    popup.appendChild(component.element as HTMLElement)
    view.dom.ownerDocument.body.appendChild(popup)
    positioned = false
  }

  function cleanup() {
    positionSeq += 1
    if (popup) {
      const leaving = popup
      const leavingComponent = component
      popup = null
      component = null
      leaving.style.visibility = 'visible'
      void animate(leaving, { opacity: 0, scale: 0.98 }, { duration: 0.08 }).finished.finally(
        () => {
          leavingComponent?.destroy()
          leaving.remove()
        },
      )
    } else {
      component?.destroy()
      component = null
    }
    positioned = false
  }

  function rectOf(view: EditorView, range: Range): DOMRect {
    const coords = view.coordsAtPos(range.to)
    return new DOMRect(coords.left, coords.top, 0, Math.max(1, coords.bottom - coords.top))
  }

  function reposition(view: EditorView) {
    if (!popup || !current.range) return
    const target = popup
    const seq = (positionSeq += 1)
    const virtualEl: VirtualElement = {
      getBoundingClientRect: () => rectOf(view, current.range!),
    }

    void computePosition(virtualEl, target, {
      placement: 'bottom-start',
      strategy: 'fixed',
      middleware: [offset(4), flip(), shift({ padding: 8 })],
    }).then(({ x, y }) => {
      if (popup !== target || seq !== positionSeq) return
      const next = { x: Math.round(x), y: Math.round(y), opacity: 1, scale: 1 }
      if (!positioned) {
        positioned = true
        void animate(target, { ...next, opacity: 0, scale: 0.98 }, { duration: 0 }).finished.then(
          () => {
            if (popup !== target || seq !== positionSeq) return
            target.style.visibility = 'visible'
            void animate(target, next, TRANSITION_FAST)
          },
        )
        return
      }

      void animate(target, next, TRANSITION)
      positioned = true
    })
  }

  function update(state: CommandMenuState, view: EditorView) {
    current = state
    if (!state.active || !state.range) {
      cleanup()
      return
    }

    ensure(view)
    component?.updateProps({
      items: state.items,
      query: state.query,
      command,
    })
    reposition(view)
  }

  function keydown(event: KeyboardEvent): boolean {
    if (!current.active || event.isComposing || event.keyCode === 229) return false
    const inst = component?.ref as CommandMenuExposed | undefined
    switch (event.key) {
      case 'ArrowDown':
        inst?.onArrowDown()
        return true
      case 'ArrowUp':
        inst?.onArrowUp()
        return true
      case 'Enter':
      case 'Tab':
        inst?.onEnter()
        return true
      case 'Escape':
        return true
    }
    return false
  }

  return { update, keydown, destroy: cleanup }
}
