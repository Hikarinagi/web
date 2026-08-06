import { Flame, LayoutList, UserRoundCheck } from '@lucide/vue'
import type { Ref } from 'vue'
import type { FeedScope } from './feed'

export const FEED_TABS = [
  { key: 'recommend', label: '动态', icon: LayoutList, auth: false },
  { key: 'hot', label: '热门', icon: Flame, auth: false },
  { key: 'following', label: '关注', icon: UserRoundCheck, auth: true },
] as const

export function useFeedTabs(scope: Ref<FeedScope>, onSelect?: (key: FeedScope) => void) {
  const auth = useAuthStore()
  const { toLogin } = useAuthGate()
  const { currentPath } = useAuthReturn()

  function select(key: FeedScope) {
    const tab = FEED_TABS.find(item => item.key === key)
    if (!tab) return
    if (tab.auth && !auth.isAuthenticated) {
      toLogin('login', currentPath.value)
      return
    }
    scope.value = key
    onSelect?.(key)
  }

  function shift(step: number) {
    const index = FEED_TABS.findIndex(item => item.key === scope.value)
    const next = FEED_TABS[index + step]
    if (next) select(next.key)
  }

  return { tabs: FEED_TABS, select, shift }
}
