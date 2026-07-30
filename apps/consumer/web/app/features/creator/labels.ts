import {
  BookCopy,
  BookImage,
  BookOpen,
  BookText,
  Building2,
  GamepadDirectional,
  Tag,
  User,
  VenetianMask,
} from '@lucide/vue'
import type { Component } from 'vue'
import type { BackendChangeRequestSummary } from '~/features/creator/contribution'

const labels = {
  GALGAME: 'Galgame',
  LIGHT_NOVEL: '轻小说',
  LIGHT_NOVEL_VOLUME: '轻小说卷',
  MANGA: '漫画',
  MANGA_VOLUME: '漫画单行本',
  PERSON: '人物',
  PRODUCER: '厂商',
  CHARACTER: '角色',
  TAG: '标签',
} satisfies Record<BackendChangeRequestSummary['resource_type'], string>

export const RESOURCE_TYPE_LABEL: Record<string, string> = labels

const slugs = {
  GALGAME: 'galgame',
  LIGHT_NOVEL: 'light-novel',
  LIGHT_NOVEL_VOLUME: 'light-novel-volume',
  MANGA: 'manga',
  MANGA_VOLUME: 'manga-volume',
  PERSON: 'person',
  PRODUCER: 'producer',
  CHARACTER: 'character',
  TAG: 'tag',
} satisfies Record<BackendChangeRequestSummary['resource_type'], string>

export const RESOURCE_SLUG: Record<string, string> = slugs

const icons = {
  GALGAME: GamepadDirectional,
  LIGHT_NOVEL: BookText,
  LIGHT_NOVEL_VOLUME: BookOpen,
  MANGA: BookImage,
  MANGA_VOLUME: BookCopy,
  PERSON: User,
  PRODUCER: Building2,
  CHARACTER: VenetianMask,
  TAG: Tag,
} satisfies Record<BackendChangeRequestSummary['resource_type'], Component>

export const RESOURCE_TYPE_ICON: Record<string, Component> = icons

export const CHANGE_REQUEST_EVENT_META: Record<
  string,
  { label: string; dot: string; text: string }
> = {
  CREATED: { label: '发起编辑', dot: 'bg-primary', text: 'text-primary' },
  UPDATED: { label: '继续编辑', dot: 'bg-primary', text: 'text-primary' },
  COMMENTED: { label: '评论', dot: 'bg-surface-400', text: 'text-muted-color' },
  REJECTED: { label: '驳回', dot: 'bg-red-500', text: 'text-red-600 dark:text-red-400' },
  APPROVED: {
    label: '通过并合并',
    dot: 'bg-green-500',
    text: 'text-green-600 dark:text-green-400',
  },
  AUTO_MERGED: {
    label: '自动合并',
    dot: 'bg-green-500',
    text: 'text-green-600 dark:text-green-400',
  },
  CLOSED: { label: '关闭', dot: 'bg-surface-400', text: 'text-muted-color' },
}

export const CHANGE_REQUEST_STATUS_META: Record<string, { label: string; badge: string }> = {
  PENDING: {
    label: '待审核',
    badge: 'border-amber-300 text-amber-600 dark:border-amber-700/60 dark:text-amber-400',
  },
  MERGED: {
    label: '已合并',
    badge: 'border-green-300 text-green-600 dark:border-green-800 dark:text-green-400',
  },
  REJECTED: {
    label: '已驳回',
    badge: 'border-red-300 text-red-600 dark:border-red-800 dark:text-red-400',
  },
  CLOSED: { label: '已关闭', badge: 'border-surface-300 text-muted-color dark:border-surface-600' },
}
