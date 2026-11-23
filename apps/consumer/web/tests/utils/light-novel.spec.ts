import { getLightNovelVolumeLabel, getLightNovelVolumeTitle } from '~/utils/media/light-novel'

const reissue = { name: '文庫版', original: false }
const original = { name: '電撃文庫', original: true }

describe('light novel volume labels', () => {
  it('puts the name of another set before the volume number', () => {
    expect(
      getLightNovelVolumeLabel({ volume_label: '2', volume_number: 2, volume_set: reissue }),
    ).toBe('文庫版 第 2 卷')
    expect(
      getLightNovelVolumeLabel({ volume_label: '上', volume_number: null, volume_set: reissue }),
    ).toBe('文庫版 上')
  })

  it('leaves the volumes of the original set and of no set as they were', () => {
    expect(
      getLightNovelVolumeLabel({ volume_label: '2', volume_number: 2, volume_set: original }),
    ).toBe('第 2 卷')
    expect(getLightNovelVolumeLabel({ volume_label: null, volume_number: 3 })).toBe('第 3 卷')
    expect(
      getLightNovelVolumeLabel({ volume_label: null, volume_number: null, volume_set: reissue }),
    ).toBeNull()
  })

  it('falls back on the labelled number for a volume with no name', () => {
    expect(
      getLightNovelVolumeTitle({
        name: '',
        name_cn: null,
        volume_label: '2',
        volume_number: 2,
        volume_set: reissue,
      }),
    ).toBe('文庫版 第 2 卷')
  })
})
