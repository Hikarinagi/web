import { AUTH_ACCESS_TOKEN_COOKIE, AUTH_REFRESH_TOKEN_COOKIE } from '@hikarinagi/shared'
import { fetchBackendData, isBackendApiError } from '../../server/utils/backend-api'

export default defineNuxtPlugin({
  name: 'auth-init',
  async setup() {
    const auth = useAuthStore()
    if (auth.loaded || auth.loading) return

    auth.setLoading(true)

    try {
      const cookieHeader = useRequestHeader('cookie')
      const hasAuthCookie =
        cookieHeader?.includes(`${AUTH_ACCESS_TOKEN_COOKIE}=`) ||
        cookieHeader?.includes(`${AUTH_REFRESH_TOKEN_COOKIE}=`)

      if (!hasAuthCookie) {
        auth.setUser(null)
        return
      }

      const event = useRequestEvent()
      if (!event) {
        auth.setUser(null)
        return
      }

      const user = await fetchBackendData(event, '/api/v3/user/me')
      auth.setUser(user)
    } catch (error) {
      if (isBackendApiError(error) && error.status === 401) auth.setUser(null)
    } finally {
      auth.setLoading(false)
    }
  },
})
