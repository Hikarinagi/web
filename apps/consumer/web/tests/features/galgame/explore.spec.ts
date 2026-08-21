import { describe, expect, it } from 'vitest'
import {
  browseRoute,
  encodeTagGroup,
  GALGAME_SORT_OPTIONS,
  readBrowseQuery,
} from '../../../app/features/galgame/explore'

describe('galgame browse query', () => {
  it('reads tag filter groups from repeated query values', () => {
    const state = readBrowseQuery({
      tag_groups: ['include.and.1.2', 'include.or.3.4', 'exclude.and.5.6'],
    })

    expect(state.tag_groups).toEqual([
      { op: 'include', match: 'and', tag_ids: [1, 2] },
      { op: 'include', match: 'or', tag_ids: [3, 4] },
      { op: 'exclude', match: 'and', tag_ids: [5, 6] },
    ])
  })

  it('serializes tag groups and drops empty drafts', () => {
    const state = readBrowseQuery({})
    const route = browseRoute({
      ...state,
      tag_groups: [
        { op: 'include', match: 'and', tag_ids: [1, 2] },
        { op: 'include', match: 'or', tag_ids: [] },
        { op: 'exclude', match: 'or', tag_ids: [5, 6] },
      ],
    })

    expect(route).toContain('tag_groups=include.and.1.2')
    expect(route).toContain('tag_groups=exclude.or.5.6')
    expect(route).not.toContain('include.or')
  })

  it('keeps tag group encoding stable', () => {
    expect(encodeTagGroup({ op: 'exclude', match: 'and', tag_ids: [5, 6] })).toBe('exclude.and.5.6')
  })

  it('keeps popularity sorting selectable on the browse page', () => {
    expect(readBrowseQuery({ sort: 'views:desc' })).toMatchObject({
      sort_field: 'views',
      sort_order: 'desc',
    })
    expect(GALGAME_SORT_OPTIONS).toContainEqual({
      label: '最热门',
      sort_field: 'views',
      sort_order: 'desc',
      value: 'views:desc',
    })
  })
})
