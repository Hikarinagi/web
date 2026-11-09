export function useTabShortcuts() {
  const store = useCreatorTabsStore()
  const actions = useCreatorTabActions()
  const focused = useActiveElement()

  useEventListener('keydown', event => {
    if (!event.altKey || event.ctrlKey || event.metaKey || event.repeat) return
    if (focused.value?.closest('[role="dialog"], [role="alertdialog"]')) return
    const current = store.active
    if (event.code === 'KeyW' && !event.shiftKey) {
      if (current && !current.pinned) actions.close(current)
    } else if (event.code === 'KeyT' && event.shiftKey) {
      actions.reopen()
    } else if (/^Digit[1-9]$/.test(event.code) && !event.shiftKey) {
      const n = Number(event.code.slice(5))
      const tab = n === 9 ? store.tabs.at(-1) : store.tabs[n - 1]
      if (tab) void actions.open(tab)
    } else return
    event.preventDefault()
  })
}
