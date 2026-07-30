import { PERMISSION_WILDCARD } from './keys'

export function permissionSatisfies(granted: string, required: string): boolean {
  if (granted === PERMISSION_WILDCARD) return true
  if (granted === required) return true
  return required.startsWith(`${granted}.`)
}

export function hasPermission(granted: Iterable<string>, required: string): boolean {
  for (const key of granted) {
    if (permissionSatisfies(key, required)) return true
  }
  return false
}
