import { PERMISSION_WILDCARD, hasPermission, type PermissionCheck } from '@hikarinagi/shared'

export function useCreatorPermissions() {
  const auth = useAuthStore()
  const { data, pending, error, refresh } = useHikariApiData('/api/v3/user/me/permissions', {
    key: computed(() => `creator-permissions:${auth.user?.id ?? 0}`),
    dedupe: 'defer',
    getCachedData: reusePayload,
  })

  const permissions = computed<string[]>(() => data.value?.permissions ?? [])

  function can(permission: PermissionCheck): boolean {
    return hasPermission(permissions.value, permission)
  }

  function canAny(namespace: PermissionCheck): boolean {
    return permissions.value.some(
      entry =>
        entry === PERMISSION_WILDCARD ||
        entry === namespace ||
        entry.startsWith(`${namespace}.`) ||
        namespace.startsWith(`${entry}.`),
    )
  }

  return { permissions, can, canAny, pending, error, refresh }
}
