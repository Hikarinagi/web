import { useReaderSettings } from '~/components/manga/reader/composables/useReaderSettings'
import { MANGA_READER_DIRECTIONS_KEY } from '~/components/manga/reader/lib/settings'

describe('useReaderSettings direction', () => {
  beforeEach(() => localStorage.clear())

  it('defaults to the direction of the work', () => {
    expect(useReaderSettings({ mangaId: 1, webtoon: false, ltr: false }).direction.value).toBe(
      'rtl',
    )
    expect(useReaderSettings({ mangaId: 2, webtoon: false, ltr: true }).direction.value).toBe('ltr')
  })

  it('remembers the chosen direction per work', async () => {
    const first = useReaderSettings({ mangaId: 1, webtoon: false, ltr: false })
    first.direction.value = 'ltr'
    await nextTick()

    expect(JSON.parse(localStorage.getItem(MANGA_READER_DIRECTIONS_KEY) ?? '{}')).toEqual({
      1: 'ltr',
    })
    expect(useReaderSettings({ mangaId: 1, webtoon: false, ltr: false }).direction.value).toBe(
      'ltr',
    )
    expect(useReaderSettings({ mangaId: 3, webtoon: false, ltr: false }).direction.value).toBe(
      'rtl',
    )
  })
})
