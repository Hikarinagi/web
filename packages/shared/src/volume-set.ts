export interface VolumeSetRef {
  id: number
  name: string
  original: boolean
}

export interface VolumeSetNameSource {
  name: string | null
  original: boolean
  labels: { name: string }[]
  publishers: { name: string }[]
}

export function volumeSetName(set: VolumeSetNameSource): string {
  return (
    set.name ||
    set.labels[0]?.name ||
    set.publishers[0]?.name ||
    (set.original ? '原版' : '其他版本')
  )
}

export function volumeSetKey(item: {
  volume_set?: Pick<VolumeSetRef, 'id' | 'original'> | null
}): number {
  return item.volume_set && !item.volume_set.original ? item.volume_set.id : 0
}
