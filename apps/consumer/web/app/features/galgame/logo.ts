export function stageLogo<T extends { language: string | null; light: string; dark: string }>(
  logos: T[],
  originLang: string | null,
) {
  const shown = logos.filter(item => item.light !== 'HIDDEN' || item.dark !== 'HIDDEN')
  const logo =
    shown.find(item => item.language === 'zh-Hans') ??
    shown.find(item => (item.language ?? originLang) === originLang) ??
    null
  return {
    logo,
    light: Boolean(logo && logo.light !== 'HIDDEN'),
    dark: Boolean(logo && logo.dark !== 'HIDDEN'),
  }
}

const LIGHT = {
  ORIGINAL: 'block',
  INVERTED: 'block invert hue-rotate-180',
  HIDDEN: 'hidden',
}

const DARK = {
  ORIGINAL: 'dark:block dark:invert-0 dark:hue-rotate-0',
  INVERTED: 'dark:block dark:invert dark:hue-rotate-180',
  HIDDEN: 'dark:hidden',
}

export function logoClass(logo: { light: keyof typeof LIGHT; dark: keyof typeof DARK }) {
  return `${LIGHT[logo.light]} ${DARK[logo.dark]}`
}
