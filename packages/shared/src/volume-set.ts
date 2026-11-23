export const VOLUME_SET_EDITIONS = [
  'TANKOBON',
  'COMPLETE',
  'REVISED',
  'BUNKO',
  'DELUXE',
  'DIGITAL',
  'SPLIT',
  'WIDE',
  'REPRINT',
  'COLOR',
  'OMNIBUS',
] as const

export type VolumeSetEdition = (typeof VOLUME_SET_EDITIONS)[number]

export const VOLUME_SET_EDITION_CN: Readonly<Record<VolumeSetEdition, string>> = {
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
}

export interface VolumeSetRef {
  id: number
  name: string
  original: boolean
  edition: string | null
}

export interface VolumeSetNameSource {
  name: string | null
  edition: string | null
  original: boolean
  labels: { name: string }[]
  publishers: { name: string }[]
}

export function volumeSetName(set: VolumeSetNameSource): string {
  return (
    (set.edition ? VOLUME_SET_EDITION_CN[set.edition as VolumeSetEdition] : undefined) ||
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
