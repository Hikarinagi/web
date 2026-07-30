const STORAGE_KEY = 'hikari:search:recent'
const MAX_ITEMS = 8

export function useSearchHistory() {
  const recent = useLocalStorage<string[]>(STORAGE_KEY, [])

  function add(keyword: string) {
    const value = keyword.trim()
    if (!value) return
    recent.value = [value, ...recent.value.filter(item => item !== value)].slice(0, MAX_ITEMS)
  }

  function remove(keyword: string) {
    recent.value = recent.value.filter(item => item !== keyword)
  }

  function clear() {
    recent.value = []
  }

  return { recent, add, remove, clear }
}
