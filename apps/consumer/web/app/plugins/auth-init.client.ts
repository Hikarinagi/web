import { useAuthSession } from '~/features/auth/composables/useAuthSession'

export default defineNuxtPlugin({
  name: 'auth-init-client',
  dependsOn: ['hikari-fetch'],
  setup() {
    const { ensureLoaded } = useAuthSession()

    onNuxtReady(() => {
      void ensureLoaded()
    })
  },
})
