import { createSharedComposable, useMediaQuery } from '@vueuse/core'

export const useNoHover = createSharedComposable(() => useMediaQuery('(hover: none)'))
