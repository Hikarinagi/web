import { describe, expect, it } from 'vitest'
import { tabKey } from '~/features/creator/tabs'

describe('tabKey', () => {
  it('keeps every part and selection of one editor in the same tab', () => {
    expect(tabKey('/entries/25271/edit/basic')).toBe('edit:25271')
    expect(tabKey('/entries/25271/edit/releases/61022?focus=41')).toBe('edit:25271')
    expect(tabKey('/entries/25271/edit')).toBe('edit:25271')
  })

  it('gives the history and the merge of an entry tabs of their own', () => {
    expect(tabKey('/entries/25271/history/12')).toBe('history:25271')
    expect(tabKey('/entries/25271/merge/30001')).toBe('merge:25271')
  })

  it('keeps the change list with its details, and the rules with their clauses', () => {
    expect(tabKey('/create/wiki/changes?f=mine')).toBe('changes')
    expect(tabKey('/create/wiki/changes/801/undo')).toBe('changes')
    expect(tabKey('/create/wiki/rules/A.7.1')).toBe('rules')
  })

  it('opens any other page of the creator center as its own tab', () => {
    expect(tabKey('/create/wiki')).toBe('/create/wiki')
    expect(tabKey('/create/wiki/new?type=GAME')).toBe('/create/wiki/new')
    expect(tabKey('/create/projects/')).toBe('/create/projects')
  })
})
