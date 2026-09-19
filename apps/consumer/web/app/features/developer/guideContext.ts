import type { InjectionKey, Ref } from 'vue'
import type { DevelopersGuidePageData } from '~~/server/api/pages/developers/guide.get'

export const GUIDE_DATA_KEY: InjectionKey<Ref<DevelopersGuidePageData | undefined>> =
  Symbol('developer-guide-data')

export function provideGuideData(data: Ref<DevelopersGuidePageData | undefined>) {
  provide(GUIDE_DATA_KEY, data)
}

export function useGuideData() {
  return inject(GUIDE_DATA_KEY, ref())
}
