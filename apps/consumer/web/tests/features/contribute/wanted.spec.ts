import { chapterNote, volumeLabel, volumeNote } from '~/features/contribute/wanted'
import type { WantedChapter, WantedVolume } from '~/features/contribute/wanted'

const label = { name: null, name_cn: null, volume_type: 'MAIN' as const, volume_label: null }

it('卷名优先用卷号，没有卷号时用书名', () => {
  expect(volumeLabel({ ...label, volume_number: 4 })).toBe('第 4 卷')
  expect(volumeLabel({ ...label, name_cn: '短篇集', volume_number: null })).toBe('短篇集')
})

it('说明读者读到的位置', () => {
  const volume = {
    readers: 2,
    previous: { ...label, id: 11, volume_number: 3 },
  } as unknown as WantedVolume
  const chapter = {
    readers: 5,
    previous: { id: 39, chapter_type: 'SERIALIZATION', chapter_number: '12', name: null },
  } as unknown as WantedChapter
  expect(volumeNote(volume)).toBe('2 位读者已读完第 3 卷')
  expect(chapterNote(chapter)).toBe('5 位读者已读至第 12 话')
})
