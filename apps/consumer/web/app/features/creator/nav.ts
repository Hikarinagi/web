import { WORKBENCH_PERMISSIONS, type PermissionCheck } from '@hikarinagi/shared'
import {
  Activity,
  BookCheck,
  BookImage,
  FilePlus,
  FolderKanban,
  LayoutDashboard,
  ListTodo,
  Megaphone,
  Upload,
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
    items: [{ label: '概览', to: '/create', also: ['/create/edits'], icon: LayoutDashboard }],
  },
  {
    label: '条目',
    items: [
      { label: '新建条目', to: '/create/new', icon: FilePlus },
      { label: '待完善', to: '/create/todos', icon: ListTodo },
      { label: '最近更改', to: '/create/changes', icon: Activity },
      { label: '公示中', to: '/create/notices', icon: Megaphone },
    ],
  },
  {
    label: '投稿',
    items: [
      { label: '发起投稿', to: '/create/submit', icon: Upload },
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
