export interface CreatorTab {
  key: string
  path: string
  title: string
  kind?: string
  pinned?: boolean
}

export interface ClosedTab extends CreatorTab {
  index: number
}

const GROUPS: [RegExp, (match: RegExpExecArray) => string][] = [
  [/^\/entries\/(\d+)\/edit(?:\/|$)/, match => `edit:${match[1]}`],
  [/^\/entries\/(\d+)\/history(?:\/|$)/, match => `history:${match[1]}`],
  [/^\/entries\/(\d+)\/merge(?:\/|$)/, match => `merge:${match[1]}`],
  [/^\/create\/wiki\/changes(?:\/|$)/, () => 'changes'],
  [/^\/create\/wiki\/rules(?:\/|$)/, () => 'rules'],
]

const TRANSIENT = ['save', 'discard', 'close', 'find', 'check', 'saved', 'later', 'undone']

export function tabKey(path: string): string {
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
