import type { FeatureFlagKey } from '~/config/site'

export type SiteFeatureFlags = Record<FeatureFlagKey, boolean>

const DEFAULTS: SiteFeatureFlags = { manga_section: false, app_download: false }

export function useFeatureFlags() {
  return useState<SiteFeatureFlags>('site:feature-flags', () => ({ ...DEFAULTS }))
}
