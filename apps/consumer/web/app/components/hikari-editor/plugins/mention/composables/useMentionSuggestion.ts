import { computePosition, flip, offset, shift, type VirtualElement } from '@floating-ui/dom'
import { VueRenderer } from '@tiptap/vue-3'
import type { Range } from '@tiptap/core'
import type { PluginKey } from '@tiptap/pm/state'
import type { SuggestionOptions, SuggestionProps } from '@tiptap/suggestion'
import { watch, type Ref } from 'vue'
import MentionSuggestionList from '../MentionSuggestionList.vue'

interface SuggestionListExposed {
  onArrowDown: () => void
  onArrowUp: () => void
  onEnter: () => void
}

interface SuggestionState {
  active: boolean
  range: Range
  query: string | null
}

export function createMentionSuggestionRender(
  loadingRef: Ref<boolean>,
  resolvedRef: Ref<boolean>,
  pluginKey: PluginKey,
): SuggestionOptions['render'] {
  return () => {
    let component: VueRenderer | null = null
    let popup: HTMLElement | null = null
    let unwatchState: (() => void) | null = null

    function isCurrent(props: SuggestionProps) {
      const state = pluginKey.getState(props.editor.state) as SuggestionState | undefined

      return (
        state?.active === true &&
        state.query === props.query &&
        state.range.from === props.range.from &&
        state.range.to === props.range.to
      )
    }

    function cleanup() {
      unwatchState?.()
      unwatchState = null
      if (popup) {
        popup.remove()
        popup = null
      }
      component?.destroy()
      component = null
    }

    function reposition(clientRect: (() => DOMRect | null) | null | undefined) {
      if (!popup || !clientRect) return
      const rect = clientRect()
      if (!rect) {
        cleanup()
        return
      }
      const virtualEl: VirtualElement = {
        getBoundingClientRect: () => rect,
      }
      void computePosition(virtualEl, popup, {
        placement: 'bottom-start',
        middleware: [offset(8), flip(), shift({ padding: 8 })],
      }).then(({ x, y }) => {
        if (!popup) return
        Object.assign(popup.style, {
          left: `${x}px`,
          top: `${y}px`,
        })
      })
    }

    return {
      onStart: props => {
        if (!isCurrent(props)) return
        cleanup()
        component = new VueRenderer(MentionSuggestionList, {
          props: {
            items: props.items,
            loading: loadingRef.value,
            resolved: resolvedRef.value,
            query: props.query,
            command: props.command,
          },
          editor: props.editor,
        })
        popup = document.createElement('div')
        popup.style.position = 'absolute'
        popup.style.left = '0'
        popup.style.top = '0'
        popup.style.zIndex = '11000'
        popup.appendChild(component.element as HTMLElement)
        document.body.appendChild(popup)
        reposition(props.clientRect)

        unwatchState = watch(loadingRef, loading => {
          component?.updateProps({ loading })
        })
      },

      onUpdate: props => {
        if (!isCurrent(props)) {
          cleanup()
          return
        }
        component?.updateProps({
          items: props.items,
          loading: loadingRef.value,
          resolved: resolvedRef.value,
          query: props.query,
          command: props.command,
        })
        reposition(props.clientRect)
      },

      onKeyDown: props => {
        if (props.event.isComposing || props.event.keyCode === 229) return false
        const inst = component?.ref as SuggestionListExposed | undefined
        switch (props.event.key) {
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
      },

      onExit: () => {
        cleanup()
      },
    }
  }
}
