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
