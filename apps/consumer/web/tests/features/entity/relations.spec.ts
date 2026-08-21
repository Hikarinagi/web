import { describe, expect, it } from 'vitest'
import { mapVoiceItems } from '../../../app/features/entity/relations'

describe('mapVoiceItems', () => {
  it('summarizes all works on one unique character card', () => {
    const items = mapVoiceItems([
      {
        character: {
          id: 92525,
          name: '中野一花',
          trans_name: null,
          image: null,
        },
        galgames: [
          { id: 1, origin_title: '五等分のプリンセス', trans_title: null, release_date: null },
          {
            id: 2,
            origin_title: 'ごとぱずストーリー',
            trans_title: '花嫁物语',
            release_date: null,
          },
          { id: 3, origin_title: '五等分の花嫁', trans_title: null, release_date: null },
        ],
      },
    ])

    expect(items).toEqual([
      {
        to: '/characters/92525',
        image: null,
        name: '中野一花',
        sub: '出演 3 部作品 · 五等分のプリンセス / 花嫁物语 等',
      },
    ])
  })

  it('keeps the concise single-work label', () => {
    const [item] = mapVoiceItems([
      {
        character: { id: 1, name: '角色', trans_name: null, image: null },
        galgames: [{ id: 1, origin_title: '作品', trans_title: null, release_date: null }],
      },
    ])

    expect(item?.sub).toBe('出自 作品')
  })
})
