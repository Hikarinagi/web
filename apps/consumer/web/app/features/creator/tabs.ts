export interface CreatorTab {
  key: string
  path: string
  title: string
}

const GROUPS: [RegExp, (match: RegExpExecArray) => string][] = [
  [/^\/entries\/(\d+)\/edit(?:\/|$)/, match => `edit:${match[1]}`],
  [/^\/entries\/(\d+)\/history(?:\/|$)/, match => `history:${match[1]}`],
  [/^\/entries\/(\d+)\/merge(?:\/|$)/, match => `merge:${match[1]}`],
  [/^\/create\/wiki\/changes(?:\/|$)/, () => 'changes'],
  [/^\/create\/wiki\/rules(?:\/|$)/, () => 'rules'],
]

export function tabKey(path: string): string {
  const bare = path.split(/[?#]/)[0]!.replace(/\/+$/, '') || '/'
  for (const [pattern, key] of GROUPS) {
    const match = pattern.exec(bare)
    if (match) return key(match)
  }
  return bare
}
