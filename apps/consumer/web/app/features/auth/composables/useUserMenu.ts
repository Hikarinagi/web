import {
  Calendar,
  CalendarCheck,
  Download,
  LayoutDashboard,
  LogOut,
  Package,
  Palette,
  Settings,
  Terminal,
  UserRound,
  Shirt,
} from '@lucide/vue'
import HikariPoint from '~/components/ui/HikariPoint.vue'
import { useDownloadEngine } from '~/features/download/useDownloadEngine'

export interface UserMenuItem {
  key?: string
  label?: string
  iconComponent?: Component
  command?: () => void
  danger?: boolean
  separator?: boolean
  balance?: number
  modeLabel?: string
  trailing?: string
}

export function useUserMenu() {
  const auth = useAuthStore()
  const { open: openLogout, pending: logoutPending } = useLogout()
  const checkin = useCheckin()
  const ledger = useHikariPointLedger()
  const theme = useThemeMode()

  const user = computed(() => auth.user)
  const roleLabel = computed(() => getUserRoleLabel(user.value?.role))
  const checkedInToday = computed(() => checkin.status.value?.checked_in_today ?? false)
  const engine = useDownloadEngine()
  const downloading = computed(() => {
    const total = engine.active.value.reduce((sum, run) => sum + run.total, 0)
    if (!engine.active.value.length || !total) return undefined
    const written = engine.active.value.reduce((sum, run) => sum + run.written, 0)
    return `正在保存 ${Math.min(100, Math.round((written / total) * 100))}%`
  })

  onMounted(() => {
    if (user.value) void checkin.ensureStatus()
  })

  const menuItems = computed<UserMenuItem[]>(() => {
    const id = user.value?.id
    return [
      {
        key: 'hikari-points',
        label: '光点',
        balance: checkin.status.value?.points ?? 0,
        iconComponent: HikariPoint,
        command: () => void ledger.open(),
      },
      {
        key: 'checkin',
        label: checkedInToday.value ? '签到日历' : '签到',
        iconComponent: checkedInToday.value ? CalendarCheck : Calendar,
        command: () => void checkin.open(),
      },
      {
        key: 'profile',
        label: '个人空间',
        iconComponent: UserRound,
        command: () => void navigateTo(`/space/${id}`),
      },
      {
        key: 'account',
        label: '账号设置',
        iconComponent: Settings,
        command: () => void navigateTo('/setting'),
      },
      {
        key: 'decoration',
        label: '我的装扮',
        iconComponent: Shirt,
        command: () => void navigateTo('/me/decoration'),
      },
      {
        key: 'items',
        label: '我的道具',
        iconComponent: Package,
        command: () => void navigateTo('/me/items'),
      },
      {
        key: 'downloads',
        label: '下载中心',
        iconComponent: Download,
        trailing: downloading.value,
        command: () => void navigateTo('/me/downloads'),
      },
      {
        key: 'site',
        label: '偏好设置',
        iconComponent: Palette,
        command: () => void navigateTo('/setting/preference'),
      },
      {
        key: 'theme',
        label: '外观',
        modeLabel: theme.current.value.label,
        iconComponent: theme.current.value.icon,
        command: () => theme.cycle(),
      },
      {
        key: 'creator',
        label: '创作者中心',
        iconComponent: LayoutDashboard,
        command: () => void navigateTo('/create', { open: { target: '_blank' } }),
      },
      {
        key: 'developers',
        label: '开发者平台',
        iconComponent: Terminal,
        command: () => void navigateTo('/developers'),
      },
      { separator: true },
      {
        key: 'logout',
        label: '退出登录',
        iconComponent: LogOut,
        danger: true,
        command: openLogout,
      },
    ]
  })

  return { user, roleLabel, menuItems, logoutPending }
}
