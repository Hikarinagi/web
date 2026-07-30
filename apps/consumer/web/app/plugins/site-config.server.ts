import { fetchBackendData } from '../../server/utils/backend-api'

export default defineNuxtPlugin({
  name: 'site-config',
  async setup() {
    const flags = useFeatureFlags()
    const event = useRequestEvent()
    if (!event) return
    try {
      const config = await fetchBackendData(event, '/api/v3/site/config')
      flags.value = config.feature_flags
    } catch {
      // keep defaults (all flags off) when the config request fails
    }
  },
})
