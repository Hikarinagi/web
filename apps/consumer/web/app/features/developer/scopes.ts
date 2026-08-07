export interface DeveloperScopeInfo {
  label: string
  description: string
  requires_user: boolean
}

export interface DeveloperScopeEntry extends DeveloperScopeInfo {
  scope: string
}

export const DEVELOPER_SCOPES = [
  {
    scope: 'catalog:read',
    label: '读取条目数据',
    description: '不含 NSFW 与乙女向条目',
    requires_user: false,
  },
  {
    scope: 'catalog:full',
    label: '读取条目数据（全部）',
    description: '含 NSFW 与乙女向条目；用户令牌下以该用户账号的内容偏好为上限',
    requires_user: false,
  },
  {
    scope: 'user:read',
    label: '读取用户公开资料',
    description: '授权用户的用户名、昵称、头像与简介',
    requires_user: true,
  },
  {
    scope: 'status:read',
    label: '读取用户的状态与评分',
    description: '授权用户在游戏/轻小说/漫画上的观看游玩状态、评分与短评',
    requires_user: true,
  },
  {
    scope: 'status:write',
    label: '修改用户的状态与评分',
    description: '代替授权用户标记状态、打分、撤回记录；含 status:read 的读取权限',
    requires_user: true,
  },
  {
    scope: 'collection:read',
    label: '读取用户的收藏夹',
    description: '授权用户的收藏夹列表及其中收录的作品',
    requires_user: true,
  },
  {
    scope: 'collection:write',
    label: '修改用户的收藏夹',
    description: '代替授权用户新建收藏夹、收录或移除作品；含 collection:read 的读取权限',
    requires_user: true,
  },
] as const satisfies readonly DeveloperScopeEntry[]

export const DEVELOPER_SCOPE_INFO: Record<string, DeveloperScopeInfo> = Object.fromEntries(
  DEVELOPER_SCOPES.map(entry => [
    entry.scope,
    { label: entry.label, description: entry.description, requires_user: entry.requires_user },
  ]),
)

const SCOPE_DOMAIN_LABEL: Record<string, string> = {
  catalog: '条目数据',
  user: '账号资料',
  status: '状态与评分',
  collection: '收藏夹',
}

export interface DeveloperScopeGroup {
  domain: string
  label: string
  requires_user: boolean
  entries: DeveloperScopeEntry[]
}

export function developerScopeGroups(): DeveloperScopeGroup[] {
  const groups = new Map<string, DeveloperScopeEntry[]>()
  for (const entry of DEVELOPER_SCOPES) {
    const domain = entry.scope.split(':')[0] as string
    groups.set(domain, [...(groups.get(domain) ?? []), entry])
  }
  return [...groups.entries()].map(([domain, entries]) => ({
    domain,
    label: SCOPE_DOMAIN_LABEL[domain] ?? domain,
    requires_user: entries.some(entry => entry.requires_user),
    entries,
  }))
}

export function parseScopes(
  scope: string | null,
): { scope: string; info: DeveloperScopeInfo | undefined }[] {
  return (scope ?? '')
    .split(' ')
    .filter(Boolean)
    .map(value => ({ scope: value, info: DEVELOPER_SCOPE_INFO[value] }))
}
