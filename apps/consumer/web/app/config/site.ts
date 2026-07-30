export type HeaderNavIcon = 'gamepad' | 'bookOpen' | 'bookImage' | 'messagesSquare'

export type FeatureFlagKey = 'manga_section'

export interface HeaderNavItem {
  label: string
  to: string
  icon: HeaderNavIcon
  match: 'exact' | 'prefix'
  flag?: FeatureFlagKey
}

export type FooterSocialIcon = 'telegram' | 'github'

export interface FooterSocialItem {
  label: string
  href: string
  icon: FooterSocialIcon
}

export interface SiteConfig {
  name: string
  title: string
  description: string
  headerNav: readonly HeaderNavItem[]
  footerSocial: readonly FooterSocialItem[]
}

export const SITE_CONFIG = {
  name: 'Hikarinagi',
  title: 'Hikarinagi - 你和同好的ACGN社区',
  description: '你和同好的ACGN社区',
  headerNav: [
    {
      label: '社区',
      to: '/',
      icon: 'messagesSquare',
      match: 'exact',
    },
    {
      label: 'Galgame',
      to: '/galgames',
      icon: 'gamepad',
      match: 'prefix',
    },
    {
      label: '轻小说',
      to: '/light-novels',
      icon: 'bookOpen',
      match: 'prefix',
    },
    {
      label: '漫画',
      to: '/mangas',
      icon: 'bookImage',
      match: 'prefix',
      flag: 'manga_section',
    },
  ],
  footerSocial: [
    {
      label: 'Telegram',
      href: 'https://t.me/hikari_nagi',
      icon: 'telegram',
    },
    {
      label: 'GitHub',
      href: 'https://github.com/Hikarinagi',
      icon: 'github',
    },
  ],
} as const satisfies SiteConfig

export const HEADER_NAV_ITEMS: readonly HeaderNavItem[] = SITE_CONFIG.headerNav
export const FOOTER_SOCIAL = SITE_CONFIG.footerSocial
