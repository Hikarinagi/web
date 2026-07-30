export function useHeaderPromoNav() {
  const { data } = useHikariApiData('/api/v3/promotions/nav-items', {
    key: 'promo-nav-items',
    server: false,
    lazy: true,
  })
  const items = computed(() => data.value ?? [])
  return { items }
}
