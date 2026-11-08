export function usePermissionCatalog() {
  const { data, pending, error, refresh } = useHikariApiData('/api/v3/permissions/catalog', {
    key: 'permission-catalog',
  })
  const entries = computed(() => data.value?.permissions ?? [])
  return { entries, pending, error, refresh }
}
