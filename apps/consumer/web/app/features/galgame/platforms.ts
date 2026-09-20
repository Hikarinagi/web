import type { PlatformCode } from '@hikarinagi/shared'

export type { PlatformCode }

const PLATFORM_LABELS = {
  win: 'Windows',
  mac: 'macOS',
  lin: 'Linux',
  dos: 'DOS',
  p98: 'PC-98',
  p88: 'PC-88',
  x68: 'Sharp X68000',
  x1s: 'Sharp X1',
  fm7: 'FM-7',
  fm8: 'FM-8',
  fmt: 'FM Towns',
  msx: 'MSX',
  pce: 'PC Engine',
  pcf: 'PC-FX',
  web: '网页',
  swi: 'Nintendo Switch',
  sw2: 'Nintendo Switch 2',
  wii: 'Wii',
  wiu: 'Wii U',
  n3d: 'Nintendo 3DS',
  nds: 'Nintendo DS',
  gba: 'Game Boy Advance',
  gbc: 'Game Boy Color',
  nes: 'Famicom',
  sfc: 'Super Famicom',
  ps5: 'PlayStation 5',
  ps4: 'PlayStation 4',
  ps3: 'PlayStation 3',
  ps2: 'PlayStation 2',
  ps1: 'PlayStation',
  psv: 'PlayStation Vita',
  psp: 'PSP',
  xbo: 'Xbox One',
  xxs: 'Xbox Series X/S',
  xb3: 'Xbox 360',
  xb1: 'Xbox',
  sat: 'Sega Saturn',
  scd: 'Sega Mega-CD',
  smd: 'Sega Mega Drive',
  drc: 'Dreamcast',
  tdo: '3DO',
  and: 'Android',
  ios: 'iOS',
  mob: '其他移动端',
  bdp: 'Blu-ray 播放器',
  dvd: 'DVD 播放器',
  vnd: 'VNDS',
  oth: '其他',
} satisfies Record<PlatformCode, string>

export const PLATFORM_OPTIONS: { value: string; label: string }[] = Object.entries(
  PLATFORM_LABELS,
).map(([value, label]) => ({ value, label }))

export interface PlatformGroup {
  key: string
  label: string
  codes: PlatformCode[]
}

export const PLATFORM_GROUPS: PlatformGroup[] = [
  { key: 'pc', label: 'PC', codes: ['win', 'mac', 'lin', 'p98'] },
  {
    key: 'console',
    label: '家用机',
    codes: ['swi', 'sw2', 'ps5', 'ps4', 'ps3', 'ps2', 'ps1', 'xbo', 'xxs', 'wii', 'sfc', 'pce'],
  },
  { key: 'handheld', label: '掌机', codes: ['psv', 'psp', 'n3d', 'nds', 'gba'] },
  { key: 'mobile', label: '移动', codes: ['ios', 'and'] },
  { key: 'web', label: '网页', codes: ['web'] },
  { key: 'other', label: '其他', codes: ['dvd', 'bdp', 'oth'] },
]

export const PLATFORM_DEEMPHASIZED: Set<PlatformCode> = new Set(['win'])

export function platformLabel(code: string): string {
  return PLATFORM_LABELS[code as PlatformCode] ?? code
}
