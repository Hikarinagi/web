import { breakpointsTailwind, createSharedComposable, useBreakpoints } from '@vueuse/core'

export const useNarrow = createSharedComposable(() =>
  useBreakpoints(breakpointsTailwind).smaller('sm'),
)
