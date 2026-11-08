export const PERMISSION_WILDCARD = '*'

export const WIKI_PERMISSIONS = {
  REVIEW: 'wiki.review',
  COMMIT: 'wiki.commit',
} as const

export const ACCESS_PERMISSIONS = {
  GROUP_MANAGE: 'access.group.manage',
} as const

export type WikiPermission = (typeof WIKI_PERMISSIONS)[keyof typeof WIKI_PERMISSIONS]
export type AccessPermission = (typeof ACCESS_PERMISSIONS)[keyof typeof ACCESS_PERMISSIONS]
