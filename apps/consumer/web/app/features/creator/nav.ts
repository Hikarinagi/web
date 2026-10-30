import { WORKBENCH_PERMISSIONS, type PermissionCheck } from '@hikarinagi/shared'
import {
  BookCheck,
  BookImage,
  ClipboardList,
  FilePlus,
  FolderKanban,
  Hourglass,
  ListChecks,
  History,
  LayoutDashboard,
  SquarePlus,
} from '@lucide/vue'
import type { Component } from 'vue'

export interface CreatorNavItem {
  label: string
  to: string
  also?: string[]
  icon: Component
  permission?: PermissionCheck
}

export interface CreatorNavGroup {
  label?: string
  items: CreatorNavItem[]
}

export const CREATOR_NAV: CreatorNavGroup[] = [
  {
    items: [{ label: '概览', to: '/create', icon: LayoutDashboard }],
  },
  {
    label: '条目编辑',
    items: [
      { label: '新建条目', to: '/create/new', icon: SquarePlus },
      { label: '我的编辑', to: '/create/edits', icon: ListChecks },
      { label: '待完善', to: '/create/todos', icon: ClipboardList },
      { label: '最近更改', to: '/create/changes', icon: History },
      { label: '公示中的编辑', to: '/create/notices', icon: Hourglass },
    ],
  },
  {
    label: '投稿',
    items: [
      { label: '发起投稿', to: '/create/submit', icon: FilePlus },
      {
        label: '我的投稿',
        to: '/create/projects',
        also: ['/create/manga'],
        icon: FolderKanban,
      },
    ],
  },
  {
    label: '审核',
    items: [
      {
        label: '小说投稿审核',
        to: '/create/project-review',
        icon: BookCheck,
        permission: WORKBENCH_PERMISSIONS.REVIEW_NOVEL,
      },
      {
        label: '漫画投稿审核',
        to: '/create/manga-review',
        icon: BookImage,
        permission: WORKBENCH_PERMISSIONS.REVIEW_MANGA,
      },
    ],
  },
]
