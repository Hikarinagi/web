import type { MessageKey } from '~~/i18n/keys'

export type HeaderNavIcon =
  'gamepad' | 'bookOpen' | 'bookImage' | 'bookUp' | 'messagesSquare' | 'smartphone'

export type FeatureFlagKey = 'manga_section' | 'app_download'

export type HeaderNavBadgeTone = 'accent' | 'neutral' | 'success' | 'warning' | 'danger' | 'info'

export interface HeaderNavBadge {
  label: MessageKey
  tone?: HeaderNavBadgeTone
}

export interface HeaderNavItem {
  label: MessageKey
  to: string
  icon: HeaderNavIcon
  match: 'exact' | 'prefix'
  flag?: FeatureFlagKey
  desktopOnly?: boolean
  badge?: HeaderNavBadge
}

export type FooterSocialIcon = 'telegram' | 'github'

export interface FooterSocialItem {
  label: string
  href: string
  icon: FooterSocialIcon
}

export interface SiteConfig {
  name: string
  headerNav: readonly HeaderNavItem[]
  footerSocial: readonly FooterSocialItem[]
}

export const SITE_CONFIG = {
  name: 'Hikarinagi',
  headerNav: [
    {
      label: 'layout.nav.community',
      to: '/',
      icon: 'messagesSquare',
      match: 'exact',
    },
    {
      label: 'layout.nav.galgame',
      to: '/galgames',
      icon: 'gamepad',
      match: 'prefix',
    },
    {
      label: 'layout.nav.lightNovel',
      to: '/light-novels',
      icon: 'bookOpen',
      match: 'prefix',
    },
    {
      label: 'layout.nav.manga',
      to: '/mangas',
      icon: 'bookImage',
      match: 'prefix',
      flag: 'manga_section',
    },
    {
      label: 'layout.nav.contribute',
      to: '/contribute',
      icon: 'bookUp',
      match: 'prefix',
      desktopOnly: true,
    },
    {
      label: 'layout.nav.app',
      to: '/app',
      icon: 'smartphone',
      match: 'prefix',
      flag: 'app_download',
      desktopOnly: true,
      badge: { label: 'layout.nav.beta', tone: 'accent' },
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
