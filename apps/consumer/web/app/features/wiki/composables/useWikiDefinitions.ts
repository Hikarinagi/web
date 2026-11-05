export function useWikiDefinitions() {
  const { data } = useHikariApiData('/api/v3/wiki/definitions', {
    key: 'wiki-definitions',
    lazy: true,
    server: false,
    toast: false,
  })
  const names = computed(
    () => new Map((data.value ?? []).map(definition => [definition.type, definition.label])),
  )
  return {
    definitions: data,
    typeName: (type: string) => names.value.get(type as never) ?? '',
  }
}
