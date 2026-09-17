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
  { label: string; tone: 'accent' | 'muted' | 'success' | 'danger' }
> = {
  CREATED: { label: '发起编辑', tone: 'accent' },
  UPDATED: { label: '继续编辑', tone: 'accent' },
  COMMENTED: { label: '评论', tone: 'muted' },
  REJECTED: { label: '驳回', tone: 'danger' },
  APPROVED: { label: '通过并合并', tone: 'success' },
  AUTO_MERGED: { label: '自动合并', tone: 'success' },
  CLOSED: { label: '关闭', tone: 'muted' },
}

export const CHANGE_REQUEST_STATUS_META: Record<
  string,
  { label: string; tone: 'neutral' | 'success' | 'warning' | 'danger' }
> = {
  PENDING: { label: '待审核', tone: 'warning' },
  MERGED: { label: '已合并', tone: 'success' },
  REJECTED: { label: '已驳回', tone: 'danger' },
  CLOSED: { label: '已关闭', tone: 'neutral' },
}
