import type { DeveloperGuideCollectionItem } from '@nuxt/content'

export type GuideNavItem = Pick<
  DeveloperGuideCollectionItem,
  'section' | 'title' | 'path' | 'description'
>

export function useGuideNav() {
  return useAsyncData('developer-guide-nav', () =>
    queryCollection('developerGuide')
      .order('order', 'ASC')
      .select('section', 'title', 'path', 'description')
      .all(),
  )
}

export function useGuideDoc(path: string) {
  return useAsyncData(`developer-guide-${path}`, () =>
    queryCollection('developerGuide').path(path).first(),
  )
}
