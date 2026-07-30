export const PLATFORM_CODES = [
  'win',
  'mac',
  'lin',
  'dos',
  'p98',
  'p88',
  'x68',
  'x1s',
  'fm7',
  'fm8',
  'fmt',
  'msx',
  'pce',
  'pcf',
  'web',
  'swi',
  'sw2',
  'wii',
  'wiu',
  'n3d',
  'nds',
  'gba',
  'gbc',
  'nes',
  'sfc',
  'ps5',
  'ps4',
  'ps3',
  'ps2',
  'ps1',
  'psv',
  'psp',
  'xbo',
  'xxs',
  'xb3',
  'xb1',
  'sat',
  'scd',
  'smd',
  'drc',
  'tdo',
  'and',
  'ios',
  'mob',
  'bdp',
  'dvd',
  'vnd',
  'oth',
] as const

export type PlatformCode = (typeof PLATFORM_CODES)[number]

const CANONICAL = new Set<string>(PLATFORM_CODES)
const ORDER_INDEX = new Map<string, number>(PLATFORM_CODES.map((code, i) => [code, i]))

// 自由文本(已 lowercase)→ 标准码。lowercase 后本身就是标准码的不必登记。
const PLATFORM_ALIASES: Record<string, string[]> = {
  pc: ['win'],
  windows: ['win'],
  windows10: ['win'],
  'windows 7/8/8.1/10': ['win'],
  'windows 2000/xp/vista/7': ['win'],
  'windows 7/8.1/10 日本語版': ['win'],
  'windows10/11': ['win'],
  'win95/win98': ['win'],
  'pc (windows)': ['win'],
  'pc（cd / dvd-rom）': ['win'],
  'pc/ons（压缩版）': ['win'],
  'nintendo switch': ['swi'],
  switch: ['swi'],
  ns: ['swi'],
  'playstation 2': ['ps2'],
  'playstation 3': ['ps3'],
  'playstation®3': ['ps3'],
  'playstation 4': ['ps4'],
  'playstation 5': ['ps5'],
  playstation: ['ps1'],
  ps: ['ps1'],
  'ps vita': ['psv'],
  psvita: ['psv'],
  'playstation®vita': ['psv'],
  android: ['and'],
  iphone: ['ios'],
  ipad: ['ios'],
  linux: ['lin'],
  'mac os': ['mac'],
  macos: ['mac'],
  'xbox one': ['xbo'],
  'xbox series x/s': ['xxs'],
  'xbox 360': ['xb3'],
  xbox360: ['xb3'],
  'pc-98': ['p98'],
  pc98: ['p98'],
  dc: ['drc'],
  '3ds': ['n3d'],
  '3ds 3dsll': ['n3d'],
  ds: ['nds'],
  'nds ndsl ndsi': ['nds'],
  'sega saturn': ['sat'],
  ss: ['sat'],
  towns: ['fmt'],
  'fm towns': ['fmt'],
  'sharp x68000': ['x68'],
  dvdpg: ['dvd'],
  'pc/psp': ['win', 'psp'],
  'pc、psp': ['win', 'psp'],
  'pc/psv': ['win', 'psv'],
  'pc/ps2': ['win', 'ps2'],
  'pc / ps2(よつのは~a journey of sincerity~)': ['win', 'ps2'],
  'pc ps3 psv': ['win', 'ps3', 'psv'],
  'ss,dc,pc': ['sat', 'drc', 'win'],
  'dc,pc,ps2': ['drc', 'win', 'ps2'],
  'ss,pc,dc': ['sat', 'win', 'drc'],
  'xbox one、xbox series x/s': ['xbo', 'xxs'],
  psvr: ['oth'],
  oculus: ['oth'],
  'steam vr': ['oth'],
  'neo geo pocket color': ['oth'],
  'game archives': ['oth'],
}

export interface NormalizePlatformsOptions {
  unknown?: 'drop' | 'oth'
  onUnmapped?: (raw: string) => void
}

export function normalizePlatforms(
  input: readonly string[],
  options: NormalizePlatformsOptions = {},
): string[] {
  const { unknown = 'drop', onUnmapped } = options
  const codes = new Set<string>()
  for (const raw of input) {
    if (!raw || typeof raw !== 'string') continue
    const value = raw.trim()
    if (CANONICAL.has(value)) {
      codes.add(value)
      continue
    }
    const key = value.toLowerCase()
    if (CANONICAL.has(key)) {
      codes.add(key)
    } else if (PLATFORM_ALIASES[key]) {
      for (const code of PLATFORM_ALIASES[key]) codes.add(code)
    } else {
      onUnmapped?.(raw)
      if (unknown === 'oth') codes.add('oth')
    }
  }
  return [...codes].sort((a, b) => (ORDER_INDEX.get(a) ?? 999) - (ORDER_INDEX.get(b) ?? 999))
}
