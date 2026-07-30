import { HEADER_NAV_ITEMS } from '~/config/site'

export function useHeaderNav() {
  const flags = useFeatureFlags()
  return computed(() => HEADER_NAV_ITEMS.filter(item => !item.flag || flags.value[item.flag]))
}
