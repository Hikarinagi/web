import type { PollNodeAttrs } from '@hikarinagi/editor-schema'
import { ref } from 'vue'

export type PollEditorDef = Omit<PollNodeAttrs, 'poll_key'>

interface PollEditorState {
  visible: boolean
  mode: 'create' | 'edit'
  initial: PollEditorDef | null
  locked: boolean
  onSave: ((def: PollEditorDef) => void | Promise<void>) | null
}

const state = ref<PollEditorState>({
  visible: false,
  mode: 'create',
  initial: null,
  locked: false,
  onSave: null,
})

export function usePollEditor() {
  function open(opts: {
    mode: 'create' | 'edit'
    initial?: PollEditorDef | null
    locked?: boolean
    onSave: (def: PollEditorDef) => void | Promise<void>
  }) {
    state.value = {
      visible: true,
      mode: opts.mode,
      initial: opts.initial ?? null,
      locked: opts.locked ?? false,
      onSave: opts.onSave,
    }
  }

  function close() {
    state.value = { ...state.value, visible: false, onSave: null }
  }

  return { state, open, close }
}
