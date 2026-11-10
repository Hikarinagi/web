import { describe, expect, it } from 'vitest'
import {
  excludeTag,
  includeTag,
  readTagGroups,
  tagConditionLabel,
  tagConditions,
  withoutCondition,
} from '../../../app/features/browse/tag-groups'

const names: Record<number, string> = { 1: '纯爱', 2: '校园', 3: '拔作', 4: '后宫' }

describe('browse tag groups', () => {
  it('adds included tags to one all-of group and excluded tags to one any-of exclusion', () => {
    const groups = excludeTag(includeTag(includeTag([], 1), 2), 3)
    expect(groups).toEqual([
      { op: 'include', match: 'and', tag_ids: [1, 2] },
      { op: 'exclude', match: 'or', tag_ids: [3] },
    ])
    expect(includeTag(groups, 3)).toEqual([{ op: 'include', match: 'and', tag_ids: [1, 2, 3] }])
  })

  it('shows one chip per tag, and one chip for an older any-of or all-of group', () => {
    const groups = readTagGroups([
      'include.and.1.2',
      'exclude.or.3',
      'include.or.2.4',
      'exclude.and.3.4',
    ])
    const labels = tagConditions(groups).map(condition =>
      tagConditionLabel(condition, id => names[id] ?? ''),
    )
    expect(labels).toEqual(['纯爱', '校园', '不含拔作', '校园 或 后宫', '不同时含拔作、后宫'])
  })

  it('removes just the chip that was closed', () => {
    const groups = readTagGroups(['include.and.1.2', 'exclude.or.3'])
    const [first] = tagConditions(groups)
    expect(withoutCondition(groups, first!)).toEqual([
      { op: 'include', match: 'and', tag_ids: [2] },
      { op: 'exclude', match: 'or', tag_ids: [3] },
    ])
  })
})
