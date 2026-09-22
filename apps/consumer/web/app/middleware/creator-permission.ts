import type { PermissionCheck } from '@hikarinagi/shared'

export default defineNuxtRouteMiddleware(async to => {
  const required = (to.meta as { requiredPermission?: PermissionCheck }).requiredPermission
  if (!required) return
  const { can, permissions, refresh } = useCreatorPermissions()
  if (permissions.value.length === 0) {
    await refresh()
  }
  if (!can(required)) {
    if (import.meta.client) {
      const { toast } = await import('@hina-ui/vue')
      toast.warning('没有权限访问该页面')
    }
    return navigateTo('/create')
  }
})
