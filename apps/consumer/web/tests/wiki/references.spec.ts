import { describe, expect, it } from 'vitest'
import { referenceSections, type ReferenceGroup } from '~/features/wiki/references'

type Item = ReferenceGroup['items'][number]

const item = (id: number, patch: Partial<Item> = {}): Item => ({
  statement_id: id,
  code: null,
  role: null,
  entry: { id, type: 'GAME', label: `条目${id}` },
  owner: null,
  sourced: false,
  credits: [],
  works: [],
  ...patch,
})

const group = (
  type: ReferenceGroup['type'],
  property: ReferenceGroup['property'],
  items: Item[],
): ReferenceGroup => ({ type, property, total: items.length, items })

describe('referenceSections', () => {
  it('leaves out the releases and the cast a game tab already shows', () => {
    const sections = referenceSections(
      [
        group('PRODUCT', 'INCLUDED_GAME', [item(2)]),
        group('APPEARANCE', 'WORK', [item(3)]),
        group('GAME', 'GAME_RELATION', [item(4)]),
      ],
      'GAME',
      [],
    )
    expect(sections.map(section => section.key)).toEqual(['GAME:GAME_RELATION'])
  })

  it('lists the works of a person by game with the roles, opening the release credited', () => {
    const game = { id: 10, type: 'GAME' as const, label: '月に寄りそう乙女の作法' }
    const [works, voiced] = referenceSections(
      [
        group('PRODUCT', 'CREDIT', [
          item(1, {
            entry: { id: 11, type: 'PRODUCT', label: '通常版' },
            owner: game,
            role: '原画',
          }),
          item(2, {
            entry: { id: 12, type: 'PRODUCT', label: '限定版' },
            owner: game,
            code: 'CHARACTER_DESIGN',
          }),
        ]),
        group('GAME', 'CREDIT', [item(3, { entry: game, role: '原画' })]),
        group('APPEARANCE', 'CREDIT', [
          item(4, {
            entry: { id: 13, type: 'APPEARANCE', label: '小倉朝日' },
            works: ['月に寄りそう乙女の作法'],
            credits: ['鈴平ひろ'],
          }),
        ]),
      ],
      'PERSON',
      [],
    )
    expect(works).toMatchObject({
      title: '参与的作品',
      total: 1,
      rows: [{ to: '/entries/10/edit/releases/11', label: '月に寄りそう乙女の作法' }],
    })
    expect(works?.rows[0]?.sub.split('、')).toHaveLength(2)
    expect(works?.rows[0]?.sub.startsWith('原画、')).toBe(true)
    expect(voiced).toMatchObject({
      title: '配音的出场角色',
      rows: [{ to: '/entries/13/edit', label: '小倉朝日', sub: '月に寄りそう乙女の作法' }],
    })
  })
})
