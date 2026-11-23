import {
  chosenSetOption,
  volumeDrawerMeta,
  volumeSetLabel,
  volumeSetOption,
} from '~/features/volume-set/sets'

const set = (over: Partial<Parameters<typeof volumeSetOption>[0]> = {}) => ({
  id: 70,
  name: null,
  original: false,
  volume_count: 24,
  labels: [],
  publishers: [],
  ...over,
})

describe('volume set options', () => {
  it('names a set the way the wiki does and keys the original set as 0', () => {
    expect(volumeSetLabel(set({ name: '完全版' }))).toBe('完全版 24 卷')
    expect(volumeSetLabel(set({ publishers: [{ name: '集英社' }] }))).toBe('集英社 24 卷')
    expect(volumeSetOption(set({ id: 69, original: true, volume_count: 31 }))).toEqual({
      value: 69,
      label: '原版 31 卷',
      key: 0,
      original: true,
    })
    expect(volumeSetOption(set()).key).toBe(70)
  })

  it('picks the chosen set, else the original, else the first', () => {
    const options = [
      volumeSetOption(set({ id: 70 })),
      volumeSetOption(set({ id: 69, original: true })),
    ]
    expect(chosenSetOption(options, 70)?.value).toBe(70)
    expect(chosenSetOption(options, null)?.value).toBe(69)
    expect(chosenSetOption(options, 999)?.value).toBe(69)
    expect(chosenSetOption(options.slice(0, 1), null)?.value).toBe(70)
    expect(chosenSetOption([], null)).toBeNull()
  })

  it('writes the release day and ISBN of a volume for the drawer', () => {
    expect(volumeDrawerMeta({ publication_date: '2015-03-10', isbn: '9784048000000' })).toBe(
      '2015-03-10，ISBN 9784048000000',
    )
    expect(volumeDrawerMeta({ publication_date: null, isbn: null })).toBe('')
  })
})
