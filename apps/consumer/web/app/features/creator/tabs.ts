export interface CreatorTab {
  id: string
  path: string
  title: string
  kind?: string
  pinned?: boolean
  opener?: string
}

export interface ClosedTab extends CreatorTab {
  position: number
}

export type Placing = 'beside' | 'end' | 'restore'

export const RECENT_LIMIT = 50

export const editKey = (id: number | string) => `edit:${id}`

const GROUPS: [RegExp, (match: RegExpExecArray) => string][] = [
  [/^\/entries\/(\d+)\/edit(?:\/|$)/, match => editKey(match[1]!)],
  [/^\/entries\/(\d+)\/history(?:\/|$)/, match => `history:${match[1]}`],
  [/^\/entries\/(\d+)\/merge(?:\/|$)/, match => `merge:${match[1]}`],
  [/^\/create\/wiki\/changes(?:\/|$)/, () => 'changes'],
  [/^\/create\/wiki\/rules(?:\/|$)/, () => 'rules'],
]

const TRANSIENT = [
  'panel',
  'edit',
  'hint',
  'save',
  'discard',
  'move',
  'focus',
  'saved',
  'later',
  'undone',
]

export function resourceKey(path: string): string {
  const bare = path.split(/[?#]/)[0]!.replace(/\/+$/, '') || '/'
  for (const [pattern, key] of GROUPS) {
    const match = pattern.exec(bare)
    if (match) return key(match)
  }
  return bare
}

export function tabPath(fullPath: string): string {
  const [rest, hash] = fullPath.split('#')
  const [path, search = ''] = rest!.split('?')
  const query = new URLSearchParams(search)
  for (const name of TRANSIENT) query.delete(name)
  const kept = query.toString()
  return `${path}${kept ? `?${kept}` : ''}${hash ? `#${hash}` : ''}`
}

export function pinnedCount(tabs: CreatorTab[]): number {
  return tabs.filter(tab => tab.pinned).length
}
