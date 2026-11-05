import {
  BookCopy,
  BookOpen,
  Building2,
  Disc3,
  FileText,
  Gamepad2,
  GitMerge,
  History,
  Library,
  Smile,
  UserRound,
  UsersRound,
} from '@lucide/vue'
import type { Component } from 'vue'
import { CREATOR_NAV } from './nav'
import type { CreatorTab } from './tabs'

const KINDS: Record<string, Component> = {
  GAME: Gamepad2,
  SERIES: Library,
  VOLUME: BookCopy,
  BOOK: BookOpen,
  PRODUCT: Disc3,
  PERSON: UserRound,
  ORGANIZATION: Building2,
  APPEARANCE: Smile,
  CHARACTER: UsersRound,
}

export function tabIcon(tab: CreatorTab): Component {
  if (tab.key.startsWith('history:')) return History
  if (tab.key.startsWith('merge:')) return GitMerge
  if (tab.kind && KINDS[tab.kind]) return KINDS[tab.kind]!
  const path = tab.path.split(/[?#]/)[0]
  const filter = new URLSearchParams(tab.path.split('?')[1]?.split('#')[0] ?? '').get('f')
  const items = CREATOR_NAV.flatMap(group => group.items).filter(item => item.to)
  const match =
    items.find(item => item.to === path && (item.filter ?? null) === filter) ??
    items
      .filter(item => path === item.to || path?.startsWith(`${item.to}/`))
      .sort((a, b) => b.to!.length - a.to!.length)[0]
  return match?.icon ?? FileText
}
