const COOKIE_KEY = 'hikari-promo-dismissed'
const DISMISS_MS = 24 * 60 * 60 * 1000

export function useBannerDismiss() {
  const dismissed = useCookie<Record<string, number>>(COOKIE_KEY, {
    default: () => ({}),
    maxAge: DISMISS_MS / 1000,
    sameSite: 'lax',
    path: '/',
  })

  function isDismissed(id: number): boolean {
    const until = dismissed.value?.[String(id)]
    return typeof until === 'number' && until > Date.now()
  }

  function dismiss(id: number) {
    const now = Date.now()
    const next: Record<string, number> = {}
    for (const [key, until] of Object.entries(dismissed.value ?? {})) {
      if (typeof until === 'number' && until > now) next[key] = until
    }
    next[String(id)] = now + DISMISS_MS
    dismissed.value = next
  }

  return { isDismissed, dismiss }
}
