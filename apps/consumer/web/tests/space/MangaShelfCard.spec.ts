import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import MangaCard from '../../app/components/space/tabs/bookshelf/MangaCard.vue'
import type { SpaceMangaShelfItem } from '~/features/space/space'

const item = (set: SpaceMangaShelfItem['current_volume_set']) =>
  ({
    manga_id: 3,
    title: '灌篮高手',
    cover: null,
    author: '井上雄彦',
    serial_status: 'FINISHED',
    total_chapters: 24,
    current_chapter_id: 163741,
    current_chapter_type: 'VOLUME',
    current_chapter_number: null,
    current_volume_number: 3,
    current_chapter_title: null,
    current_volume_set: set,
    current_chapter_ordinal: 1,
    current_chapter_index: 3,
    first_chapter_id: 163739,
    is_latest: false,
    is_finished: false,
    last_read: new Date().toISOString(),
  }) as SpaceMangaShelfItem

const text = (set: SpaceMangaShelfItem['current_volume_set']) =>
  mount(MangaCard, {
    props: { item: item(set) },
    global: { stubs: { HikariImage: true, SpaceTabsBookshelfCardMenu: true } },
  }).text()

describe('SpaceTabsBookshelfMangaCard', () => {
  it('names the set of a volume read in another set and leaves a volume of the original bare', () => {
    expect(text({ id: 70, name: '完全版', original: false })).toContain('读到 完全版 第 3 卷')
    expect(text({ id: 69, name: 'ジャンプコミックス', original: true })).toContain('读到 第 3 卷')
    expect(text(null)).toContain('读到 第 3 卷')
  })
})
