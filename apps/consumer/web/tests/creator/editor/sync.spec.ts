import { describe, expect, it } from 'vitest'
import {
  readExternalIds,
  relationCandidates,
  scalarCandidates,
} from '../../../app/features/creator/editor/sync'

describe('readExternalIds', () => {
  it('prefixes galgame vndb id and stringifies bangumi_game_id', () => {
    expect(readExternalIds('galgame', { bangumi_game_id: 3154, vndb_id: 2002 })).toEqual({
      bangumi_id: '3154',
      vndb_id: 'v2002',
    })
  })

  it('uses bangumi_book_id for light novels', () => {
    expect(readExternalIds('light-novel', { bangumi_book_id: 5397 })).toEqual({
      bangumi_id: '5397',
      vndb_id: undefined,
    })
  })

  it('uses raw string ids for entities (already prefixed)', () => {
    expect(readExternalIds('producer', { bangumi_id: '8779', vndb_id: 'p43' })).toEqual({
      bangumi_id: '8779',
      vndb_id: 'p43',
    })
  })

  it('returns null when no external id is present, or the type is not syncable', () => {
    expect(readExternalIds('galgame', { bangumi_game_id: null, vndb_id: '' })).toBeNull()
    expect(readExternalIds('tag', { name: 'x' })).toBeNull()
  })
})

describe('scalarCandidates', () => {
  const fields = [
    { field: 'intro', kind: 'scalar', value_type: 'string' },
    { field: 'trans_title', kind: 'scalar', value_type: 'string' },
    { field: 'aliases', kind: 'scalar', value_type: 'string[]' },
    { field: 'homepage', kind: 'scalar', value_type: 'string' },
    { field: 'release_date', kind: 'scalar', value_type: 'date' },
    { field: 'characters', kind: 'relation' },
  ]
  const skip = new Set(['bangumi_game_id', 'vndb_id', 'id'])

  it('marks empty-current non-conflict, differing-current conflict; skips same/empty-source/relation/non-field; carries source', () => {
    const draft = {
      intro: '新简介',
      trans_title: '命运石之门',
      aliases: ['A', 'B'],
      homepage: '',
      vndb_id: 2002,
      not_a_field: 'x',
    }
    const current = { intro: '', trans_title: '旧标题', aliases: ['B', 'A'], homepage: null }
    const out = scalarCandidates(draft, current, fields, skip, {
      intro: 'vndb',
      trans_title: 'bangumi',
    })
    expect(out).toEqual([
      {
        field: 'intro',
        value_type: 'string',
        from: '',
        to: '新简介',
        source: 'vndb',
        conflict: false,
      },
      {
        field: 'trans_title',
        value_type: 'string',
        from: '旧标题',
        to: '命运石之门',
        source: 'bangumi',
        conflict: true,
      },
    ])
  })

  it('treats a Date and an equal date-string as the same (no false date conflict)', () => {
    const draft = { release_date: '2009-10-15' }
    const current = { release_date: new Date('2009-10-15T00:00:00.000Z') }
    expect(scalarCandidates(draft, current, fields, new Set(), {})).toEqual([])
  })
})

describe('relationCandidates', () => {
  it('drops relations already present and dedupes by target_id', () => {
    const source = [
      { target_id: 5, name: 'A', cover: null, relation: 'SEQUEL', source: 'bangumi' },
      { target_id: 6, name: 'B', cover: 'c.jpg', relation: 'PREQUEL', source: 'vndb' },
      { target_id: 6, name: 'B', cover: 'c.jpg', relation: 'PREQUEL', source: 'vndb' },
    ]
    expect(relationCandidates(source, new Set([5]))).toEqual([
      { target_id: 6, name: 'B', cover: 'c.jpg', relation: 'PREQUEL', source: 'vndb' },
    ])
  })
})
