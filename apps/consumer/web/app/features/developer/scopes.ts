export interface DeveloperScopeInfo {
  label: string
  description: string
}

export interface DeveloperScopeEntry extends DeveloperScopeInfo {
  scope: string
}

export const DEVELOPER_SCOPES = [
  {
    scope: 'catalog:read',
    label: '读取条目数据',
    description: '不含 NSFW 与乙女向条目',
  },
  {
    scope: 'catalog:full',
    label: '读取条目数据(全部)',
    description: '含 NSFW 与乙女向条目',
  },
] as const satisfies readonly DeveloperScopeEntry[]

export const DEVELOPER_SCOPE_INFO: Record<string, DeveloperScopeInfo> = Object.fromEntries(
  DEVELOPER_SCOPES.map(entry => [
    entry.scope,
    { label: entry.label, description: entry.description },
  ]),
)

const SCOPE_DOMAIN_LABEL: Record<string, string> = {
  catalog: '条目数据',
}

export interface DeveloperScopeGroup {
  domain: string
  label: string
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
