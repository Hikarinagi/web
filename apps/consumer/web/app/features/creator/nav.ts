import { WIKI_PERMISSIONS, WORKBENCH_PERMISSIONS, type PermissionCheck } from '@hikarinagi/shared'
import {
  BookCheck,
  BookImage,
  BookOpenText,
  Eye,
  FilePlus,
  FolderKanban,
  History,
  LayoutDashboard,
  NotebookPen,
  Search,
  ShieldCheck,
  Upload,
  UserPen,
} from '@lucide/vue'
import type { Component } from 'vue'

export interface CreatorNavItem {
  label: string
  icon: Component
  to?: string
  filter?: string
  also?: string[]
  permission?: PermissionCheck
  find?: boolean
  unchecked?: boolean
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
    label: '维基',
    items: [
      { label: '查找条目', icon: Search, find: true },
      { label: '工作台', to: '/create/wiki', icon: NotebookPen },
      { label: '新建条目', to: '/create/wiki/new', icon: FilePlus },
      { label: '全部修改', to: '/create/wiki/changes', icon: History },
      {
        label: '未检查的修改',
        to: '/create/wiki/changes',
        filter: 'unchecked',
        icon: ShieldCheck,
        permission: WIKI_PERMISSIONS.PATROL,
        unchecked: true,
      },
      { label: '我的修改', to: '/create/wiki/changes', filter: 'mine', icon: UserPen },
      { label: '我关注的', to: '/create/wiki/changes', filter: 'watched', icon: Eye },
      { label: '编辑规范', to: '/create/wiki/rules', icon: BookOpenText },
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
