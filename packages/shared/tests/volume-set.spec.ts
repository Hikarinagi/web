import {
  VOLUME_SET_EDITIONS,
  VOLUME_SET_EDITION_CN,
  volumeSetKey,
  volumeSetName,
} from '../src/volume-set'

describe('volumeSetName', () => {
  const set = (over: Partial<Parameters<typeof volumeSetName>[0]> = {}) => ({
    name: null,
    edition: null,
    original: false,
    labels: [],
    publishers: [],
    ...over,
  })

  it('names the set by the Chinese name of its edition before anything else', () => {
    expect(
      volumeSetName(
        set({
          edition: 'COMPLETE',
          name: 'SLAM DUNK 完全版',
          labels: [{ name: 'ジャンプ・コミックスデラックス' }],
          publishers: [{ name: '集英社' }],
        }),
      ),
    ).toBe('完全版')
    expect(volumeSetName(set({ edition: 'DIGITAL', original: true }))).toBe('电子单行本')
    expect(volumeSetName(set({ edition: 'TANKOBON', labels: [{ name: '毒りんごcomic' }] }))).toBe(
      '单行本',
    )
  })

  it('falls back on the recorded name when the edition is missing or unknown', () => {
    expect(volumeSetName(set({ edition: 'SOMETHING_ELSE', name: '秋田文庫' }))).toBe('秋田文庫')
    expect(volumeSetName(set({ name: '完全版', labels: [{ name: '少年ジャンプ' }] }))).toBe(
      '完全版',
    )
  })

  it('takes the recorded name, then the label, then the publisher', () => {
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

describe('VOLUME_SET_EDITION_CN', () => {
  it('names every edition in Chinese', () => {
    expect(Object.keys(VOLUME_SET_EDITION_CN)).toEqual([...VOLUME_SET_EDITIONS])
    expect(VOLUME_SET_EDITION_CN).toEqual({
      TANKOBON: '单行本',
      COMPLETE: '完全版',
      REVISED: '新装版',
      BUNKO: '文库版',
      DELUXE: '爱藏版',
      DIGITAL: '电子单行本',
      SPLIT: '分册版',
      WIDE: '大开本版',
      REPRINT: '复刻版',
      COLOR: '彩色版',
      OMNIBUS: '合本版',
    })
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
