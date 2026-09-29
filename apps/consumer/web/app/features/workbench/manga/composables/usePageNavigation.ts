import type { BackendMangaPage } from '../manga'
import type { useMangaRegions } from './useMangaRegions'

export function usePageNavigation(
  pages: () => BackendMangaPage[],
  store: ReturnType<typeof useMangaRegions>,
  options: { preferUnrendered: boolean; onOpen?: () => void },
) {
  const route = useRoute()
  const router = useRouter()
  const requested = Number(route.query.page)
  const pageId = ref(
    (
      pages().find(item => item.id === requested) ??
      (options.preferUnrendered ? pages().find(item => !item.rendered_url) : undefined) ??
      pages()[0]
    )?.id ?? null,
  )
  const page = computed(() => pages().find(item => item.id === pageId.value) ?? pages()[0] ?? null)
  const regions = computed(() => (page.value ? store.of(page.value.id) : []))

  function open(id: number) {
    options.onOpen?.()
    if (id === pageId.value) return
    pageId.value = id
    store.selectedId.value = null
    void router.replace({ query: { ...route.query, page: String(id) } })
  }

  function advance(direction: 1 | -1) {
    const index = regions.value.findIndex(region => region.id === store.selectedId.value)
    const target = regions.value[index + direction]
    if (target) {
      store.selectedId.value = target.id
      return
    }
    const list = pages()
    const next = list[list.findIndex(item => item.id === page.value?.id) + direction]
    if (!next) return
    open(next.id)
    const nextRegions = store.of(next.id)
    store.selectedId.value = (direction > 0 ? nextRegions[0] : nextRegions.at(-1))?.id ?? null
  }

  useEventListener('keydown', (event: KeyboardEvent) => {
    if ((event.target as HTMLElement | null)?.closest('input, textarea, [contenteditable]')) return
    const modifier = event.ctrlKey || event.metaKey
    const step =
      event.key === 'PageDown' || (modifier && event.key === 'ArrowRight')
        ? 1
        : event.key === 'PageUp' || (modifier && event.key === 'ArrowLeft')
          ? -1
          : 0
    const list = pages()
    const next = step && page.value ? list[list.indexOf(page.value) + step] : undefined
    if (!next) return
    event.preventDefault()
    open(next.id)
  })

  return { page, regions, open, advance }
}
