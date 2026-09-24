import { useMediaQuery } from '@vueuse/core'

export const DESK_LARGE_MEDIA = '(min-width: 2200px)'

export const useDeskSize = createSharedComposable(() => {
  const large = useMediaQuery(DESK_LARGE_MEDIA)
  return {
    large,
    control: computed<'sm' | 'md'>(() => (large.value ? 'md' : 'sm')),
    field: computed<'md' | 'lg'>(() => (large.value ? 'lg' : 'md')),
    body: computed<'sm' | 'base'>(() => (large.value ? 'base' : 'sm')),
    caption: computed<'xs' | 'sm'>(() => (large.value ? 'sm' : 'xs')),
  }
})
