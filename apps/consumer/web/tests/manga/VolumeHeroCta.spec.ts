import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import Cta from '../../app/components/manga/volume/hero/Cta.vue'
import type { MangaVolumePageData } from '~~/server/api/pages/manga-volumes/[id].get'

type Chapter = MangaVolumePageData['chapters'][number]

const volume = {
  id: 87119,
  series_id: 13258,
  volume_number: 3,
  name: '隠し部屋 3',
  publication_date: '2018-06-22T00:00:00.000Z',
  manga: { name: '隠し部屋', name_cn: null },
} as unknown as MangaVolumePageData['volume']

const whole = (parts: Chapter['parts']) =>
  ({
    id: 10365099,
    chapter_type: 'VOLUME',
    chapter_number: null,
    volume_number: 3,
    volume_id: 87119,
    title: null,
    ordinal: 1,
    page_count: 91,
    readable: true,
    parts,
  }) as unknown as Chapter

const stubs = {
  MangaVolumeContribute: { template: '<span />' },
  MangaDownloadAction: { template: '<span />' },
  ShareButton: { template: '<span />' },
}

const text = (parts: Chapter['parts']) =>
  mount(Cta, {
    props: { volume, volumes: [], chapters: [whole(parts)], progress: null },
    global: { stubs },
  }).text()

describe('MangaVolumeHeroCta', () => {
  it('names the splits a volume holds instead of offering the whole volume', () => {
    expect(text({ held: [1], count: 2 })).toContain('阅读本卷（上）')
    expect(text({ held: [1, 2], count: 3 })).toContain('阅读本卷（上、中）')
    expect(text({ held: [2], count: 4 })).toContain('阅读本卷（2/4）')
  })

  it('offers the whole volume once every split is in', () => {
    expect(text(null)).toContain('阅读本卷')
  })
})
