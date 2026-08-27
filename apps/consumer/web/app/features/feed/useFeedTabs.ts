import { Clock, Compass, LayoutList, UserRoundCheck } from '@lucide/vue'
import type { FeedScope } from './feed'

export const FEED_TABS = [
  { key: 'recommend', label: '推荐', icon: Compass, auth: false },
  { key: 'latest', label: '最新', icon: Clock, auth: false },
  { key: 'all', label: '全站', icon: LayoutList, auth: false },
  { key: 'following', label: '关注', icon: UserRoundCheck, auth: true },
] as const

const DEFAULT_SCOPE: FeedScope = 'all'

export function useFeedTabs(onSelect?: (key: FeedScope) => void) {
  const route = useRoute()
  const router = useRouter()
  const auth = useAuthStore()
  const { toLogin } = useAuthGate()
  const { currentPath } = useAuthReturn()

  const scope = computed<FeedScope>(() => {
    const raw = Array.isArray(route.query.tab) ? route.query.tab[0] : route.query.tab
    return FEED_TABS.find(tab => tab.key === raw)?.key ?? DEFAULT_SCOPE
  })

  const active = computed<FeedScope | null>(() => (route.path === '/' ? scope.value : null))

  function select(key: FeedScope) {
    const tab = FEED_TABS.find(item => item.key === key)
    if (!tab) return
    if (tab.auth && !auth.isAuthenticated) {
      toLogin('login', currentPath.value)
      return
    }
    const target = { path: '/', query: key === DEFAULT_SCOPE ? {} : { tab: key } }
    if (route.path === '/') void router.replace(target)
    else void router.push(target)
    onSelect?.(key)
  }

  return { tabs: FEED_TABS, scope, active, select }
}
