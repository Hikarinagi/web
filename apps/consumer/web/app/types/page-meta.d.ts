import type { PermissionCheck } from '@hikarinagi/shared'

declare module '#app' {
  interface PageMeta {
    requiredPermission?: PermissionCheck
  }
}

export {}
