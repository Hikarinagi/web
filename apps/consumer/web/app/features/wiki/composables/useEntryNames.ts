import { ENTRY_EDITOR } from '~/features/wiki/composables/useEntryEditor'

export function useEntryNames(target: () => number | null, enabled: () => boolean) {
  const editor = inject(ENTRY_EDITOR, null)
  const fetched = shallowRef<{ id: number; names: string[] } | null>(null)

  watch(
    [target, enabled],
    async ([id, on]) => {
      if (!id || !on || editor?.entries.value.has(id) || fetched.value?.id === id) return
      const entry = await hikariRequest('/api/v3/wiki/entries/{id}', {
        path: { id },
        toast: false,
      }).catch(() => null)
      if (!entry || target() !== id) return
      fetched.value = {
        id,
        names: entry.statements
          .filter(item => item.property === 'NAME' && item.status !== 'DEPRECATED' && item.text)
          .map(item => item.text!),
      }
    },
    { immediate: true },
  )

  return computed(() => {
    const id = target()
    if (!id) return null
    if (editor?.entries.value.has(id))
      return editor
        .property(id, 'NAME')
        .values.filter(item => item.state !== 'removed' && item.state !== 'moved_out')
        .flatMap(item => (item.value.text ? [item.value.text] : []))
    return fetched.value?.id === id ? fetched.value.names : null
  })
}
