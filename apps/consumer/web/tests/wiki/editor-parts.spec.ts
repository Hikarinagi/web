import { describe, expect, it } from 'vitest'
import { emptyDraft, emptyValue, type EntryStatement } from '~/features/wiki/editor/draft'
import { changedParts, partOf } from '~/features/wiki/editor/parts'
import { editorPath } from '~/features/wiki/editor/route'

describe('partOf', () => {
  it('puts each value of a game tab under the part that shows it', () => {
    expect(partOf('GAME', 'GAME', 'TITLE')).toBe('basic')
    expect(partOf('GAME', 'GAME', 'SAMPLE_IMAGE')).toBe('images')
    expect(partOf('GAME', 'PRODUCT', 'COVER')).toBe('releases')
    expect(partOf('GAME', 'PRODUCT', 'PRICE')).toBe('releases')
    expect(partOf('GAME', 'APPEARANCE', 'LABEL')).toBe('cast')
    expect(partOf('GAME', 'GAME', 'CREDIT')).toBe('basic')
    expect(partOf('GAME', 'GAME', 'GAME_RELATION')).toBe('relations')
    expect(partOf('SERIES', 'BOOK', 'ISBN')).toBe('volumes')
    expect(partOf('SERIES', 'SERIES', 'CREDIT')).toBe('credits')
  })
})

describe('changedParts', () => {
  it('counts the changes of a tab part by part', () => {
    const title = { id: 11, property: 'TITLE', position: 0 } as EntryStatement
    const price = { id: 21, property: 'PRICE', position: 0 } as EntryStatement
    const statements = new Map([
      [11, { entry: 1, statement: title }],
      [21, { entry: 2, statement: price }],
    ])
    const draft = emptyDraft()
    draft.changed[11] = emptyValue()
    draft.removed[21] = null
    draft.added.push({ id: -1, entry: 2, property: 'COVER', value: emptyValue() })
    const types = new Map([
      [1, 'GAME'],
      [2, 'PRODUCT'],
    ] as const)
    expect(changedParts('GAME', draft, statements, id => types.get(id as 1 | 2))).toEqual({
      basic: 1,
      releases: 2,
    })
  })
})

describe('editorPath', () => {
  it('reads the part and the selected entries from the address', () => {
    expect(editorPath('GAME', [])).toMatchObject({ part: 'basic', selection: [], panel: null })
    expect(editorPath('GAME', ['releases', '61022'])).toMatchObject({
      part: 'releases',
      selection: [61022],
      panel: null,
    })
    expect(editorPath('SERIES', ['volumes', '7', '-2'])).toMatchObject({
      part: 'volumes',
      selection: [7, -2],
      panel: null,
    })
    expect(editorPath('PERSON', ['basic'])).toMatchObject({
      part: null,
      selection: [],
      panel: null,
    })
    expect(editorPath('GAME', ['cast', 'protect'])).toMatchObject({
      part: 'cast',
      selection: [],
      panel: 'protect',
      segments: ['cast'],
    })
    expect(editorPath('GAME', ['releases', '61022', 'preview'])).toMatchObject({
      part: 'releases',
      selection: [61022],
      panel: 'preview',
      segments: ['releases', '61022'],
    })
  })

  it('reads the suggestion being dismissed and keeps the part under it', () => {
    expect(editorPath('GAME', ['releases', '61022', 'suggestions', '9', 'dismiss'])).toEqual({
      part: 'releases',
      selection: [61022],
      panel: 'dismiss',
      suggestion: 9,
      edit: null,
      segments: ['releases', '61022'],
    })
    expect(editorPath('PERSON', ['suggestions', '9', 'dismiss'])).toMatchObject({
      panel: 'dismiss',
      suggestion: 9,
      segments: [],
    })
    expect(editorPath('GAME', ['dismiss'])).toMatchObject({ panel: null, suggestion: null })
  })

  it('reads the edit being undone and keeps the part under it', () => {
    expect(editorPath('GAME', ['cast', 'undo', '535'])).toMatchObject({
      part: 'cast',
      panel: 'undo',
      edit: 535,
      segments: ['cast'],
    })
    expect(editorPath('GAME', ['undo'])).toMatchObject({ panel: null, edit: null })
  })
})
