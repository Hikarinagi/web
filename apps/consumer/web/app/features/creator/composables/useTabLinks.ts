export function useTabLinks() {
  const router = useRouter()
  const nav = useTabNav()

  function handle(event: MouseEvent) {
    const wanted =
      event.type === 'auxclick'
        ? event.button === 1
        : event.button === 0 && (event.ctrlKey || event.metaKey)
    if (!wanted || event.defaultPrevented) return
    const link = (event.target as Element | null)?.closest<HTMLAnchorElement>('a[href]')
    if (!link || link.target || link.hasAttribute('download') || link.closest('[data-creator-tab]'))
      return
    const url = new URL(link.href, window.location.href)
    if (url.origin !== window.location.origin) return
    const target = router.resolve(`${url.pathname}${url.search}${url.hash}`)
    if (target.meta.layout !== 'creator') return
    event.preventDefault()
    event.stopPropagation()
    void nav.open(target.fullPath, event.shiftKey)
  }

  useEventListener(document, 'click', handle, { capture: true })
  useEventListener(document, 'auxclick', handle, { capture: true })
}
