import type { TagFilterGroup, TagFilterOp, TagMatchMode } from './filter'

const TAG_GROUP_PATTERN = /^(include|exclude)\.(and|or)\.([1-9]\d*(?:\.[1-9]\d*)*)$/

export function encodeTagGroup(group: TagFilterGroup): string {
  return `${group.op}.${group.match}.${group.tag_ids.join('.')}`
}

export function normalizeTagGroups(groups: TagFilterGroup[]): TagFilterGroup[] {
  const seen = new Set<string>()
  const out: TagFilterGroup[] = []
  for (const group of groups) {
    const tag_ids = [...new Set(group.tag_ids.filter(id => Number.isInteger(id) && id > 0))]
    if (!tag_ids.length) continue
    const normalized: TagFilterGroup = { op: group.op, match: group.match, tag_ids }
    const key = encodeTagGroup(normalized)
    if (seen.has(key)) continue
    seen.add(key)
    out.push(normalized)
  }
  return out
}

export function readTagGroups(value: unknown): TagFilterGroup[] {
  const raw =
    value == null ? [] : Array.isArray(value) ? value.map(String) : String(value).split(',')
  return normalizeTagGroups(
    raw.flatMap(item => {
      const match = TAG_GROUP_PATTERN.exec(item.trim())
      if (!match || !match[1] || !match[2] || !match[3]) return []
      return [
        {
          op: match[1] as TagFilterOp,
          match: match[2] as TagMatchMode,
          tag_ids: match[3].split('.').map(Number),
        },
      ]
    }),
  )
}

export function tagIdsOf(groups: TagFilterGroup[]): number[] {
  return [
    ...new Set(groups.flatMap(group => group.tag_ids.filter(id => Number.isInteger(id) && id > 0))),
  ]
}

export interface TagCondition {
  key: string
  ids: number[]
  excluded: boolean
  any: boolean
}

export function withoutTag(groups: TagFilterGroup[], id: number): TagFilterGroup[] {
  return groups
    .map(group => ({ ...group, tag_ids: group.tag_ids.filter(item => item !== id) }))
    .filter(group => group.tag_ids.length > 0)
}

export function includeTag(groups: TagFilterGroup[], id: number): TagFilterGroup[] {
  const rest = withoutTag(groups, id)
  const index = rest.findIndex(group => group.op === 'include' && group.match === 'and')
  if (index < 0) return [...rest, { op: 'include', match: 'and', tag_ids: [id] }]
  return rest.map((group, i) =>
    i === index ? { ...group, tag_ids: [...group.tag_ids, id] } : group,
  )
}

export function excludeTag(groups: TagFilterGroup[], id: number): TagFilterGroup[] {
  const rest = withoutTag(groups, id)
  const index = rest.findIndex(group => group.op === 'exclude' && group.match === 'or')
  if (index < 0) return [...rest, { op: 'exclude', match: 'or', tag_ids: [id] }]
  return rest.map((group, i) =>
    i === index ? { ...group, tag_ids: [...group.tag_ids, id] } : group,
  )
}

export function tagConditions(groups: TagFilterGroup[]): TagCondition[] {
  return groups.flatMap((group, index) => {
    const excluded = group.op === 'exclude'
    const single = excluded ? group.match === 'or' : group.match === 'and'
    if (single || group.tag_ids.length === 1)
      return group.tag_ids.map(id => ({
        key: `tag:${index}:${id}`,
        ids: [id],
        excluded,
        any: false,
      }))
    return [{ key: `tag:${index}`, ids: group.tag_ids, excluded, any: !excluded }]
  })
}

export function tagConditionLabel(condition: TagCondition, nameOf: (id: number) => string): string {
  const names = condition.ids.map(nameOf)
  if (condition.any) return names.join(' 或 ')
  if (condition.excluded)
    return names.length > 1 ? `不同时含${names.join('、')}` : `不含${names[0] ?? ''}`
  return names[0] ?? ''
}

export function withoutCondition(
  groups: TagFilterGroup[],
  condition: TagCondition,
): TagFilterGroup[] {
  const ids = new Set(condition.ids)
  return groups
    .map(group =>
      group.op === (condition.excluded ? 'exclude' : 'include')
        ? { ...group, tag_ids: group.tag_ids.filter(id => !ids.has(id)) }
        : group,
    )
    .filter(group => group.tag_ids.length > 0)
}
