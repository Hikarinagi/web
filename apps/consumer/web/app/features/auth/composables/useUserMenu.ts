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
import type { MessageKey } from '~~/i18n/keys'

export interface UserMenuItem {
  key?: string
  label?: MessageKey
  iconComponent?: Component
  command?: () => void
  danger?: boolean
  separator?: boolean
  balance?: number
  modeLabel?: MessageKey
  trailing?: string
}

export function useUserMenu() {
  const auth = useAuthStore()
  const { open: openLogout, pending: logoutPending } = useLogout()
  const checkin = useCheckin()
  const ledger = useHikariPointLedger()
  const theme = useThemeMode()
  const { t } = useLocaleText()

  const user = computed(() => auth.user)
  const roleLabel = computed(() => getUserRoleLabel(user.value?.role))
  const checkedInToday = computed(() => checkin.status.value?.checked_in_today ?? false)
  const engine = useDownloadEngine()
  const downloading = computed(() => {
    const total = engine.active.value.reduce((sum, run) => sum + run.total, 0)
    if (!engine.active.value.length || !total) return undefined
    const written = engine.active.value.reduce((sum, run) => sum + run.written, 0)
    return t('layout.userMenu.downloading', {
      percent: Math.min(100, Math.round((written / total) * 100)),
    })
  })

  onMounted(() => {
    if (user.value) void checkin.ensureStatus()
  })

  const menuItems = computed<UserMenuItem[]>(() => {
    const id = user.value?.id
    return [
      {
        key: 'hikari-points',
        label: 'layout.userMenu.points',
        balance: checkin.status.value?.points ?? 0,
        iconComponent: HikariPoint,
        command: () => void ledger.open(),
      },
      {
        key: 'checkin',
        label: checkedInToday.value ? 'layout.userMenu.checkinCalendar' : 'layout.userMenu.checkin',
        iconComponent: checkedInToday.value ? CalendarCheck : Calendar,
        command: () => void checkin.open(),
      },
      {
        key: 'profile',
        label: 'layout.userMenu.space',
        iconComponent: UserRound,
        command: () => void navigateTo(`/space/${id}`),
      },
      {
        key: 'account',
        label: 'layout.userMenu.account',
        iconComponent: Settings,
        command: () => void navigateTo('/setting'),
      },
      {
        key: 'decoration',
        label: 'layout.userMenu.decoration',
        iconComponent: Shirt,
        command: () => void navigateTo('/me/decoration'),
      },
      {
        key: 'items',
        label: 'layout.userMenu.items',
        iconComponent: Package,
        command: () => void navigateTo('/me/items'),
      },
      {
        key: 'downloads',
        label: 'layout.userMenu.downloads',
        iconComponent: Download,
        trailing: downloading.value,
        command: () => void navigateTo('/me/downloads'),
      },
      {
        key: 'site',
        label: 'layout.userMenu.preference',
        iconComponent: Palette,
        command: () => void navigateTo('/setting/preference'),
      },
      {
        key: 'theme',
        label: 'layout.userMenu.theme',
        modeLabel: theme.current.value.label,
        iconComponent: theme.current.value.icon,
        command: () => theme.cycle(),
      },
      {
        key: 'creator',
        label: 'common.section.creator',
        iconComponent: LayoutDashboard,
        command: () => void navigateTo('/create', { open: { target: '_blank' } }),
      },
      {
        key: 'developers',
        label: 'common.section.developers',
        iconComponent: Terminal,
        command: () => void navigateTo('/developers'),
      },
      { separator: true },
      {
        key: 'logout',
        label: 'layout.userMenu.logout',
        iconComponent: LogOut,
        danger: true,
        command: openLogout,
      },
    ]
  })

  return { user, roleLabel, menuItems, logoutPending }
}
