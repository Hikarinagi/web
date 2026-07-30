import {
  ACCESS_PERMISSIONS,
  COMMUNITY_PERMISSIONS,
  WIKI_PERMISSIONS,
  type PermissionCheck,
} from '@hikarinagi/shared'
import {
  BadgeCheck,
  ClipboardCheck,
  GitPullRequest,
  Layers,
  LayoutDashboard,
  Shield,
  SquarePen,
} from '@lucide/vue'
import type { Component } from 'vue'

export interface CreatorNavItem {
  label: string
  to: string
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
    label: '我的贡献',
    items: [
      { label: '变更请求', to: '/create/contributions', icon: GitPullRequest },
      { label: '发起编辑', to: '/create/edit', icon: SquarePen },
    ],
  },
  {
    label: '审核',
    items: [
      {
        label: '审核队列',
        to: '/create/review',
        icon: ClipboardCheck,
        permission: WIKI_PERMISSIONS.REVIEW,
      },
    ],
  },
  {
    label: '治理',
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
  {
    label: '审核组',
    items: [{ label: '申请加入', to: '/create/membership', icon: BadgeCheck }],
  },
]
