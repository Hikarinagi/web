import { fetchBackendData, isBackendApiError } from '../../server/utils/backend-api'
import { hasSessionCookies } from '../../server/utils/backend-request'

export default defineNuxtPlugin({
  name: 'auth-init',
  async setup() {
    const auth = useAuthStore()
    if (auth.loaded || auth.loading) return

    auth.setLoading(true)

    try {
      const event = useRequestEvent()
      if (!event || !hasSessionCookies(event)) {
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
