export function useEntryHints(entry: number) {
  return useHikariApiData('/api/v3/wiki/todos', {
    key: `wiki-entry-hints-${entry}`,
    query: { within: entry, page: 1, page_size: 100 },
    lazy: true,
    server: false,
    toast: false,
    dedupe: 'defer',
  })
}
