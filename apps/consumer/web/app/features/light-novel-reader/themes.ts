export interface ReaderTheme {
  index: number
  label: string
  background: string
  text: string
  dark: boolean
}

export const READER_SYSTEM_THEME = 100

export const READER_THEMES: readonly ReaderTheme[] = [
  { index: 0, label: '默认', background: '#ffffff', text: '#1f2937', dark: false },
  { index: 1, label: '柔白', background: '#fdf6e3', text: '#3a3a3a', dark: false },
  { index: 2, label: '暖米', background: '#f4ead4', text: '#2d2a22', dark: false },
  { index: 3, label: '淡绿', background: '#e4efe4', text: '#1f2d1f', dark: false },
  { index: 4, label: '浅灰', background: '#ebebeb', text: '#1f1f1f', dark: false },
  { index: 5, label: '夜间', background: '#1f2227', text: '#e6e6e6', dark: true },
  { index: 6, label: '深黑', background: '#111111', text: '#dadada', dark: true },
]

export function readerTheme(index: number, systemDark: boolean): ReaderTheme {
  const target = index === READER_SYSTEM_THEME ? (systemDark ? 5 : 0) : index
  return READER_THEMES.find(theme => theme.index === target) ?? READER_THEMES[0]!
}

function shellTokens({ background: b, text: t, dark }: ReaderTheme) {
  const accent = dark ? 'var(--color-brand-400)' : 'var(--color-brand-500)'
  return [
    `color-scheme:${dark ? 'dark' : 'light'}`,
    `--hn-bg-canvas:${b}`,
    `--hn-surface:${b}`,
    `--hn-bg-subtle:color-mix(in oklab,${t} 4%,${b})`,
    `--hn-bg-inset:color-mix(in oklab,${t} 8%,${b})`,
    `--hn-bg-scrim:rgb(0 0 0 / ${dark ? 0.6 : 0.32})`,
    `--hn-bg-veil:color-mix(in srgb,${b} 70%,transparent)`,
    `--hn-fg-default:${t}`,
    `--hn-fg-max:${t}`,
    `--hn-fg-muted:color-mix(in oklab,${t} 72%,${b})`,
    `--hn-fg-subtle:color-mix(in oklab,${t} 56%,${b})`,
    `--hn-fg-disabled:color-mix(in oklab,${t} 38%,${b})`,
    `--hn-border:color-mix(in srgb,${t} 10%,transparent)`,
    `--hn-border-strong:color-mix(in srgb,${t} 18%,transparent)`,
    `--hn-accent:${accent}`,
    `--hn-accent-text:${dark ? 'var(--color-brand-400)' : 'var(--color-brand-700)'}`,
    `--hn-accent-soft:color-mix(in oklab,${accent} ${dark ? 24 : 12}%,${b})`,
    `--hn-neutral-solid:${t}`,
    `--hn-neutral-solid-on:${b}`,
    `--hn-state-hover-opacity:${dark ? 0.09 : 0.06}`,
    `--hn-state-press-opacity:${dark ? 0.13 : 0.1}`,
    `--hn-state-selected-opacity:${dark ? 0.2 : 0.14}`,
  ].join(';')
}

export function shellStyle(index: number) {
  if (index !== READER_SYSTEM_THEME) {
    return `html:root:root{${shellTokens(readerTheme(index, false))}}`
  }
  return [
    `html:root:root{${shellTokens(readerTheme(index, false))}}`,
    `@media (prefers-color-scheme:dark){html:root:root{${shellTokens(readerTheme(index, true))}}}`,
  ].join('')
}
