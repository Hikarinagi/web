import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import BookCard from '../../app/components/space/tabs/bookshelf/BookCard.vue'
import type { SpaceBookshelfItem } from '~/features/space/space'

const item = (set: SpaceBookshelfItem['current_volume_set']) =>
  ({
    light_novel_id: 3,
    title: '凉宫春日的忧郁',
    cover: null,
    author: '谷川流',
    total_volumes: 11,
    current_volume_id: 12,
    current_volume_number: 2,
    current_volume_title: '涼宮ハルヒの溜息',
    current_volume_set: set,
    current_volume_cover: null,
    percentage: 40,
    current_chapter_title: null,
    is_finished: false,
    last_read: new Date().toISOString(),
  }) as SpaceBookshelfItem

const text = (set: SpaceBookshelfItem['current_volume_set']) =>
  mount(BookCard, {
    props: { item: item(set) },
    global: { stubs: { HikariImage: true, SpaceTabsBookshelfCardMenu: true } },
  }).text()

describe('SpaceTabsBookshelfBookCard', () => {
  it('names the set of a volume read in another set and leaves a volume of the original bare', () => {
    expect(text({ id: 61, name: '新装版', original: false })).toContain('读到 新装版 第 2 卷')
    expect(text({ id: 60, name: '角川スニーカー文庫', original: true })).toContain('读到 第 2 卷')
    expect(text(null)).toContain('读到 第 2 卷')
  })
})
