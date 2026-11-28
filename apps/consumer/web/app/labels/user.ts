import type { UserRole } from '~/types/auth'

export function getUserRoleLabel(value: UserRole | null | undefined) {
  return translate(`layout.role.${value ?? 'USER'}`)
}
