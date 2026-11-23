import { volumeSetKey, volumeSetName } from '../src/volume-set'

describe('volumeSetName', () => {
  const set = (over: Partial<Parameters<typeof volumeSetName>[0]> = {}) => ({
    name: null,
    original: false,
    labels: [],
    publishers: [],
    ...over,
  })

  it('takes the recorded name, then the label, then the publisher', () => {
    expect(volumeSetName(set({ name: '完全版', labels: [{ name: '少年ジャンプ' }] }))).toBe(
      '完全版',
    )
    expect(
      volumeSetName(set({ labels: [{ name: '秋田文庫' }], publishers: [{ name: '秋田書店' }] })),
    ).toBe('秋田文庫')
    expect(volumeSetName(set({ publishers: [{ name: '集英社' }] }))).toBe('集英社')
  })

  it('falls back on whether the set is the original', () => {
    expect(volumeSetName(set({ original: true }))).toBe('原版')
    expect(volumeSetName(set())).toBe('其他版本')
  })
})

describe('volumeSetKey', () => {
  it('groups the original set with volumes of no set and keys any other set by its id', () => {
    expect(volumeSetKey({ volume_set: null })).toBe(0)
    expect(volumeSetKey({})).toBe(0)
    expect(volumeSetKey({ volume_set: { id: 69, original: true } })).toBe(0)
    expect(volumeSetKey({ volume_set: { id: 70, original: false } })).toBe(70)
  })
})
