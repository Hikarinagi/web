import type { SidebarState } from '@hina-ui/vue'

const CREATOR_SIDEBAR_STATE_COOKIE = 'hikari-creator-sidebar-state'
const CREATOR_SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 365

export function useCreatorSidebar() {
  const state = useCookie<SidebarState>(CREATOR_SIDEBAR_STATE_COOKIE, {
    default: () => 'expanded',
    maxAge: CREATOR_SIDEBAR_COOKIE_MAX_AGE,
    path: '/',
    sameSite: 'lax',
  })

  return { state }
}
