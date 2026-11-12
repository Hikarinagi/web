import type { ApiData } from '@hikarinagi/api-contract/v3'
import type { EntryEditor } from '~/features/wiki/composables/useEntryEditor'

type EditCheck = ApiData<'/api/v3/wiki/edits/checks', 'post'>
export type EditResult = ApiData<'/api/v3/wiki/edits', 'post'>

export function editBody(editor: EntryEditor) {
  const draft = editor.draft.value
  return {
    operations: editor.operations(),
    base: Object.entries(draft.base).map(([entry, revision]) => ({
      entry_id: Number(entry),
      revision,
    })),
    ...(draft.note.trim() ? { note: draft.note.trim() } : {}),
    ...(draft.basis.url.trim() || draft.basis.media.length
      ? {
          basis: {
            url: draft.basis.url.trim() || null,
            media: draft.basis.media.map(item => item.id),
          },
        }
      : {}),
  }
}

export function useSaveFlow(
  editor: EntryEditor,
  saved: (result?: EditResult) => Promise<void> | void,
) {
  const watching = useLocalStorage('hikari-wiki-watch-on-save', true, { initOnMounted: true })
  const check = shallowRef<EditCheck | null>(null)
  const checking = ref(false)
  const saving = ref(false)
  const bus = useWikiSavedBus()
  const nav = usePageNav()
  const body = () => editBody(editor)

  async function inspect() {
    checking.value = true
    try {
      check.value = await hikariRequest('/api/v3/wiki/edits/checks', {
        method: 'POST',
        body: body(),
        toast: false,
      })
    } catch {
      check.value = null
    } finally {
      checking.value = false
    }
  }

  async function save() {
    saving.value = true
    try {
      const result = await hikariRequest('/api/v3/wiki/edits', { method: 'POST', body: body() })
      if (watching.value)
        await Promise.all(
          result.entries.map(id =>
            hikariRequest('/api/v3/wiki/entries/{id}/watch', {
              method: 'PUT',
              path: { id },
              toast: false,
            }).catch(() => undefined),
          ),
        )
      editor.discard()
      bus.emit(result.entries)
      check.value = null
      await nav.query({ save: null, undone: null, saved: String(result.edit_id) }, 'replace')
      await saved(result)
      return true
    } catch {
      return false
    } finally {
      saving.value = false
    }
  }

  return { watching, check, checking, saving, inspect, save }
}
