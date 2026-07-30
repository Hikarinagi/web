import type { UserRole } from '~/types/auth'

const USER_ROLE_LABELS: Record<UserRole, string> = {
  USER: '用户',
  ADMIN: '管理员',
  SUPER_ADMIN: '超级管理员',
}

export function getUserRoleLabel(value: UserRole | null | undefined) {
  return USER_ROLE_LABELS[value ?? 'USER']
}
