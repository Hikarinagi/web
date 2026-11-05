export default defineNuxtPlugin(() => {
  if (typeof BroadcastChannel === 'undefined') return
  const channel = new BroadcastChannel('hikari-wiki-saved')
  const remote = useEventBus<number[]>('wiki-saved-remote')
  useWikiSavedBus().on(entries => channel.postMessage(entries))
  channel.addEventListener('message', event => {
    if (Array.isArray(event.data)) remote.emit(event.data as number[])
  })
})
