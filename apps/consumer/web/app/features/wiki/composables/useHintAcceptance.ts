import { toast } from '@hina-ui/vue'
import type { useEntryEditor } from '~/features/wiki/composables/useEntryEditor'
import { emptyValue } from '~/features/wiki/editor/draft'
import { proposedValue, type WikiHint } from '~/features/wiki/hints'

type EntryEditor = ReturnType<typeof useEntryEditor>

export function useHintAcceptance(editor: EntryEditor, changed: () => Promise<void>) {
  const accepting = ref<number | null>(null)

  function fill(proposal: NonNullable<WikiHint['proposal']>) {
    const current = proposal.current
    if (current) {
      const before = editor.draft.value.changed[current.id]
      const working = editor
        .property(proposal.entry_id, proposal.property)
        .values.find(item => item.id === current.id)
      editor.set(current.id, proposedValue(proposal, working?.value ?? emptyValue()))
      toast.success('已填入建议的值', {
        cancel: {
          label: '撤销',
          onClick: () => (before ? editor.set(current.id, before) : editor.revert(current.id)),
        },
      })
      return
    }
    const id = editor.add(
      proposal.entry_id,
      proposal.property,
      proposedValue(proposal, emptyValue()),
    )
    toast.success('已填入建议的值', {
      cancel: { label: '撤销', onClick: () => editor.revert(id) },
    })
  }

  async function undo(edit: number) {
    await hikariRequest('/api/v3/wiki/edits/{id}/revert', {
      method: 'POST',
      path: { id: edit },
      body: {},
    })
    toast.success('已撤销')
    await changed()
  }

  async function accept(hint: WikiHint) {
    const proposal = hint.proposal
    if (
      proposal &&
      editor
        .property(proposal.entry_id, proposal.property)
        .values.some(item => item.state !== 'same')
    ) {
      fill(proposal)
      return
    }
    accepting.value = hint.id
    try {
      const result = await hikariRequest('/api/v3/wiki/todos/{id}/acceptance', {
        method: 'POST',
        path: { id: hint.id },
        body: {},
      })
      toast.success('已采纳', {
        action: {
          label: '查看本次修改',
          onClick: () => void navigateTo(`/create/wiki/changes/${result.edit_id}`),
        },
        cancel: { label: '撤销', onClick: () => void undo(result.edit_id) },
      })
      await changed()
    } finally {
      accepting.value = null
    }
  }

  return { accepting, accept }
}
