const CREATOR_SIDEBAR_COLLAPSED_COOKIE = 'hikari-creator-sidebar-collapsed'
const CREATOR_SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 365

export function useCreatorSidebar() {
  const collapsedCookie = useCookie<boolean>(CREATOR_SIDEBAR_COLLAPSED_COOKIE, {
    default: () => false,
    maxAge: CREATOR_SIDEBAR_COOKIE_MAX_AGE,
    path: '/',
    sameSite: 'lax',
  })

  const collapsed = computed({
    get: () => collapsedCookie.value === true,
    set: value => {
      collapsedCookie.value = value
    },
  })

  function toggle() {
    collapsed.value = !collapsed.value
  }

  return { collapsed, toggle }
}
