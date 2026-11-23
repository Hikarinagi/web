import { volumeDrawerMeta, volumeSetLabel } from '~/features/volume-set/sets'

const set = (over: Partial<Parameters<typeof volumeSetLabel>[0]> = {}) => ({
  name: null,
  edition: null,
  original: false,
  volume_count: 24,
  labels: [],
  publishers: [],
  ...over,
})

describe('volume sets', () => {
  it('names a set the way the wiki does and counts its volumes', () => {
    expect(
      volumeSetLabel(set({ edition: 'COMPLETE', name: 'ジャンプ・コミックスデラックス' })),
    ).toBe('完全版 24 卷')
    expect(volumeSetLabel(set({ name: '完全版' }))).toBe('完全版 24 卷')
    expect(volumeSetLabel(set({ publishers: [{ name: '集英社' }] }))).toBe('集英社 24 卷')
    expect(volumeSetLabel(set({ original: true, volume_count: 31 }))).toBe('原版 31 卷')
  })

  it('writes the release day and ISBN of a volume for the drawer', () => {
    expect(volumeDrawerMeta({ publication_date: '2015-03-10', isbn: '9784048000000' })).toBe(
      '2015-03-10，ISBN 9784048000000',
    )
    expect(volumeDrawerMeta({ publication_date: null, isbn: null })).toBe('')
  })
})
