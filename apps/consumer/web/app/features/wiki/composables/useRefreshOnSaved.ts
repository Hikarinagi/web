export function useWikiSavedBus() {
  return useEventBus<number[]>('wiki-saved')
}

export function useRefreshOnSaved(
  refresh: () => unknown,
  related?: () => number[] | null | undefined,
) {
  const active = usePageActive()
  const stale = ref(false)
  const touches = (entries: number[]) => {
    const mine = related?.()
    return !mine || mine.some(id => entries.includes(id))
  }
  useWikiSavedBus().on(entries => {
    if (!active.value && touches(entries)) stale.value = true
  })
  useEventBus<number[]>('wiki-saved-remote').on(entries => {
    if (!touches(entries)) return
    if (active.value) void refresh()
    else stale.value = true
  })
  onActivated(() => {
    if (!stale.value) return
    stale.value = false
    void refresh()
  })
}
