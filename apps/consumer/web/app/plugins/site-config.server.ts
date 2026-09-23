import type { ApiData } from '@hikarinagi/api-contract/v3'
import type { ApiResponse } from '@hikarinagi/shared'

type SiteConfig = ApiData<'/api/v3/site/config', 'get'>

export default defineNuxtPlugin({
  name: 'site-config',
  async setup() {
    const flags = useFeatureFlags()
    const event = useRequestEvent()
    if (!event) return
    try {
      const body = await event.$fetch<ApiResponse<SiteConfig>>('/api/v3/site/config', {
        headers: { accept: 'application/json' },
      })
      if (body.success) flags.value = { ...flags.value, ...body.data.feature_flags }
    } catch {
      // keep defaults (all flags off) when the config request fails
    }
  },
})
