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
      label: '热门',
      sort_field: 'views',
      sort_order: 'desc',
      value: 'views:desc',
    })
  })

  it('forces discussion heat sorting to desc and exposes the option', () => {
    expect(readBrowseQuery({ sort: 'discussion_heat:desc' })).toMatchObject({
      sort_field: 'discussion_heat',
      sort_order: 'desc',
    })
    expect(readBrowseQuery({ sort: 'discussion_heat:asc' })).toMatchObject({
      sort_field: 'discussion_heat',
      sort_order: 'desc',
    })
    expect(GALGAME_SORT_OPTIONS).toContainEqual({
      label: '热议',
      sort_field: 'discussion_heat',
      sort_order: 'desc',
      value: 'discussion_heat:desc',
    })
  })

  it('reads dev status filters and drops unknown values', () => {
    expect(readBrowseQuery({})).toMatchObject({ dev_status: [] })
    expect(readBrowseQuery({ status: 'RELEASED,IN_DEVELOPMENT' })).toMatchObject({
      dev_status: ['RELEASED', 'IN_DEVELOPMENT'],
    })
    expect(readBrowseQuery({ status: 'RELEASED,FOO,RELEASED' })).toMatchObject({
      dev_status: ['RELEASED'],
    })
  })

  it('serializes dev status filters into the browse route', () => {
    const route = browseRoute({
      ...readBrowseQuery({}),
      dev_status: ['RELEASED', 'CANCELLED'],
    })

    expect(route).toContain('status=RELEASED%2CCANCELLED')
    expect(route).not.toContain('dev=')
  })

  it('reads start/end time filters and maps legacy release params', () => {
    const state = readBrowseQuery({
      sfrom: '2020',
      sto: '2021-06',
      eperiods: '2022,2023-01',
      sort: 'end_date:desc',
    })
    expect(state).toMatchObject({
      sort_field: 'end_date',
      start_from: '2020',
      start_to: '2021-06',
      start_periods: [],
      end_periods: ['2022', '2023-01'],
    })

    const legacy = readBrowseQuery({ from: '2019-03', to: '2020', sort: 'release_date:asc' })
    expect(legacy).toMatchObject({
      sort_field: 'start_date',
      sort_order: 'asc',
      start_from: '2019-03',
      start_to: '2020',
    })
  })

  it('serializes start/end filters into the browse route', () => {
    const route = browseRoute({
      ...readBrowseQuery({}),
      start_from: '2020',
      start_to: '2021-06',
      end_periods: ['2022'],
    })

    expect(route).toContain('sfrom=2020')
    expect(route).toContain('sto=2021-06')
    expect(route).toContain('eperiods=2022')
    expect(route).not.toMatch(/[?&]from=/)
    expect(route).not.toMatch(/[?&]periods=/)
  })
})
