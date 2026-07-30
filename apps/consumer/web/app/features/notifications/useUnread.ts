import type { UnreadSummary } from './notifications'

const EMPTY: UnreadSummary = { total: 0, interaction: 0, notification: 0, system: 0 }

const summary = shallowRef<UnreadSummary>({ ...EMPTY })

export function useUnread() {
  function set(next: UnreadSummary | null) {
    summary.value = next ?? { ...EMPTY }
  }

  return {
    summary: readonly(summary),
    unreadCount: computed(() => summary.value.total),
    set,
  }
}
