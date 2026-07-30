export function useAuthReturn() {
  const route = useRoute()

  const currentPath = computed(() => route.fullPath || '/')
  const redirectTo = computed(() => normalizeRedirect(route.query.redirect_to))
  const returnPath = computed(() => {
    if (route.path === '/login' || route.path === '/register') return redirectTo.value
    return currentPath.value
  })
  const loginTo = computed(() => {
    const redirect_to = returnPath.value
    return { path: '/login', query: { redirect_to } }
  })
  const registerTo = computed(() => {
    const redirect_to = returnPath.value
    return { path: '/register', query: { redirect_to } }
  })

  async function goBack() {
    await navigateTo(redirectTo.value, { replace: true })
  }

  return {
    currentPath,
    goBack,
    loginTo,
    redirectTo,
    registerTo,
  }
}

function normalizeRedirect(value: unknown) {
  if (typeof value !== 'string') return '/'
  if (!value.startsWith('/') || value.startsWith('//')) return '/'
  if (value === '/login' || value.startsWith('/login?')) return '/'
  if (value === '/register' || value.startsWith('/register?')) return '/'
  return value
}
