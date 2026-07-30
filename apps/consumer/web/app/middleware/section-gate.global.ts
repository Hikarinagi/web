import { HEADER_NAV_ITEMS } from '~/config/site'

export default defineNuxtRouteMiddleware(to => {
  const flags = useFeatureFlags()
  const blocked = HEADER_NAV_ITEMS.some(
    item =>
      item.flag &&
      !flags.value[item.flag] &&
      (to.path === item.to || to.path.startsWith(`${item.to}/`)),
  )
  if (blocked) return navigateTo('/')
})
