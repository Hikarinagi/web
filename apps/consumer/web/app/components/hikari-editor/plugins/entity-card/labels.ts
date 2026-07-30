import {
  BookA,
  BookImage,
  BookOpen,
  Building2,
  GamepadDirectional,
  MessageSquareText,
  Newspaper,
  Star,
  User,
  UserSquare,
} from '@lucide/vue'
import type { Component } from 'vue'
import type { EntityCardType } from './types'

interface EntityCardMeta {
  label: string
  icon: Component
  searchPlaceholder: string
}

export const ENTITY_CARD_META: Record<EntityCardType, EntityCardMeta> = {
  galgame: { label: 'Galgame', icon: GamepadDirectional, searchPlaceholder: '搜索 Galgame...' },
  light_novel: { label: '轻小说', icon: BookA, searchPlaceholder: '搜索轻小说...' },
  light_novel_volume: {
    label: '轻小说卷',
    icon: BookOpen,
    searchPlaceholder: '搜索轻小说卷...',
  },
  manga: { label: '漫画', icon: BookImage, searchPlaceholder: '搜索漫画...' },
  person: { label: '人物', icon: User, searchPlaceholder: '搜索人物...' },
  producer: { label: '厂商', icon: Building2, searchPlaceholder: '搜索厂商...' },
  character: { label: '角色', icon: UserSquare, searchPlaceholder: '搜索角色...' },
  article: { label: '文章', icon: Newspaper, searchPlaceholder: '搜索文章...' },
  post: { label: '图文', icon: MessageSquareText, searchPlaceholder: '搜索图文...' },
  galgame_rate: {
    label: 'Galgame 评分',
    icon: Star,
    searchPlaceholder: '搜索你评分过的 Galgame...',
  },
  light_novel_rate: {
    label: '轻小说评分',
    icon: Star,
    searchPlaceholder: '搜索你评分过的轻小说...',
  },
  manga_rate: {
    label: '漫画评分',
    icon: Star,
    searchPlaceholder: '搜索你评分过的漫画...',
  },
}
