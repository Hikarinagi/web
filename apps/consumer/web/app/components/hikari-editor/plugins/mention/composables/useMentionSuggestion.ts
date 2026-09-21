import { ref, shallowRef, watch, type Ref } from 'vue'
import type { ApiData } from '@hikarinagi/api-contract/v3'
import type { Editor, Range } from '@tiptap/core'
import type { PluginKey } from '@tiptap/pm/state'
import type { SuggestionOptions, SuggestionProps } from '@tiptap/suggestion'
import type { OverlayAnchor } from '@hina-ui/vue'

export type MentionUser = ApiData<'/api/v3/user', 'get'>['items'][number]

interface MentionSession {
  ownerId: symbol
  editor: Editor
  query: string
  items: MentionUser[]
  loading: boolean
  resolved: boolean
  anchor: OverlayAnchor
  command: (item: MentionUser) => void
}

interface SuggestionState {
  active: boolean
  range: Range
  query: string | null
}

const session = shallowRef<MentionSession | null>(null)
const highlighted = ref(0)

export function useMentionSuggestion() {
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
    current.command(item)
    return true
  }

  return { session, highlighted, hide, move, commit }
}

export function createMentionSuggestionRender(
  ownerId: symbol,
  loadingRef: Ref<boolean>,
  resolvedRef: Ref<boolean>,
  pluginKey: PluginKey,
): SuggestionOptions['render'] {
  const menu = useMentionSuggestion()

  return () => {
    let live: SuggestionProps | null = null
    let anchor: OverlayAnchor | null = null
    let lastRect: DOMRect | null = null
    let stopWatch: (() => void) | null = null

    function isCurrent(props: SuggestionProps) {
      const state = pluginKey.getState(props.editor.state) as SuggestionState | undefined

      return (
        state?.active === true &&
        state.query === props.query &&
        state.range.from === props.range.from &&
        state.range.to === props.range.to
      )
    }

    function publish() {
      const props = live
      if (!props || !anchor) return
      session.value = {
        ownerId,
        editor: props.editor,
        query: props.query,
        items: props.items as MentionUser[],
        loading: loadingRef.value,
        resolved: resolvedRef.value,
        anchor,
        command: props.command,
      }
    }

    function cleanup() {
      stopWatch?.()
      stopWatch = null
      const editor = live?.editor
      live = null
      anchor = null
      lastRect = null
      menu.hide(editor)
    }

    return {
      onStart: props => {
        if (!isCurrent(props)) return
        cleanup()
        live = props
        highlighted.value = 0
        anchor = {
          contextElement: props.editor.view.dom,
          getBoundingClientRect: () => {
            const rect = live?.clientRect?.()
            if (rect) lastRect = rect
            return lastRect ?? new DOMRect()
          },
        }
        publish()
        stopWatch = watch([loadingRef, resolvedRef], publish)
      },

      onUpdate: props => {
        if (!isCurrent(props)) {
          cleanup()
          return
        }
        live = props
        if (highlighted.value >= props.items.length) highlighted.value = 0
        publish()
      },

      onKeyDown: props => {
        if (props.event.isComposing || props.event.keyCode === 229) return false
        switch (props.event.key) {
          case 'ArrowDown':
            return menu.move(1)
          case 'ArrowUp':
            return menu.move(-1)
          case 'Enter':
          case 'Tab':
            return menu.commit()
          case 'Escape':
            return true
        }
        return false
      },

      onExit: cleanup,
    }
  }
}
