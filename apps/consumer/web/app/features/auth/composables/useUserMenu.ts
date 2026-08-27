import {
  Calendar,
  CalendarCheck,
  LayoutDashboard,
  LogOut,
  Palette,
  Settings,
  Terminal,
  UserRound,
  Shirt,
} from '@lucide/vue'
import type { MenuItem } from 'primevue/menuitem'
import HikariPoint from '~/components/ui/HikariPoint.vue'

export function useUserMenu() {
  const auth = useAuthStore()
  const { open: openLogout, pending: logoutPending } = useLogout()
  const checkin = useCheckin()
  const ledger = useHikariPointLedger()
  const theme = useThemeMode()

  const user = computed(() => auth.user)
  const roleLabel = computed(() => getUserRoleLabel(user.value?.role))
  const checkedInToday = computed(() => checkin.status.value?.checked_in_today ?? false)

  onMounted(() => {
    if (user.value) void checkin.ensureStatus()
  })

  const menuItems = computed<MenuItem[]>(() => {
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
        command: () => void navigateTo('/setting/decoration'),
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
