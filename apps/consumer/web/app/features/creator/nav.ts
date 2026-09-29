import {
  ACCESS_PERMISSIONS,
  COMMUNITY_PERMISSIONS,
  WIKI_PERMISSIONS,
  WORKBENCH_PERMISSIONS,
  type PermissionCheck,
} from '@hikarinagi/shared'
import {
  BadgeCheck,
  BookCheck,
  BookImage,
  ClipboardCheck,
  FilePlus,
  FolderKanban,
  GitPullRequest,
  Layers,
  LayoutDashboard,
  Shield,
  SquarePen,
  UserRoundPlus,
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
      { label: '发起编辑', to: '/create/edit', icon: SquarePen },
      { label: '我的变更请求', to: '/create/contributions', icon: GitPullRequest },
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
        label: '变更请求审核',
        to: '/create/review',
        icon: ClipboardCheck,
        permission: WIKI_PERMISSIONS.REVIEW,
      },
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
      { label: '加入审核组', to: '/create/membership', icon: UserRoundPlus },
    ],
  },
  {
    label: '管理',
    items: [
      {
        label: '权限组',
        to: '/create/governance/groups',
        icon: Shield,
        permission: ACCESS_PERMISSIONS.GROUP_MANAGE,
      },
      {
        label: '审核组申请',
        to: '/create/governance/applications',
        icon: BadgeCheck,
        permission: ACCESS_PERMISSIONS.GROUP_MANAGE,
      },
      {
        label: '板块',
        to: '/create/governance/sections',
        icon: Layers,
        permission: COMMUNITY_PERMISSIONS.SECTION_MANAGE,
      },
    ],
  },
]
