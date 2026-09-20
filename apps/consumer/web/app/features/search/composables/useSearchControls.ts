import type { useSearch } from '~/features/search/composables/useSearch'

export function useSearchControls(search: ReturnType<typeof useSearch>) {
  function onKeydown(e: KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      search.moveActive(1)
      return
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      search.moveActive(-1)
      return
    }
    if (e.key !== 'Enter') return
    if (search.activeIndex >= 0) {
      search.activateActive()
      return
    }
    search.submit()
  }

  function onPick(keyword: string) {
    search.submit(keyword)
  }

  return { onKeydown, onPick }
}
