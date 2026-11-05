export function useWikiSavedBus() {
  return useEventBus<number[]>('wiki-saved')
}

export function useRefreshOnSaved(
  refresh: () => unknown,
  related?: () => number[] | null | undefined,
) {
  const active = usePageActive()
  const stale = ref(false)
  useWikiSavedBus().on(entries => {
    if (active.value) return
    const mine = related?.()
    if (mine && !mine.some(id => entries.includes(id))) return
    stale.value = true
  })
  onActivated(() => {
    if (!stale.value) return
    stale.value = false
    void refresh()
  })
}
