import { breakpointsTailwind, useBreakpoints } from '@vueuse/core'
import { usePostComposerDialog } from '~/components/feed/composer/composables/usePostComposerDialog'

export function usePostOwnerActions() {
  const router = useRouter()
  const composerDialog = usePostComposerDialog()
  const isDesktop = useBreakpoints(breakpointsTailwind).greaterOrEqual('md')

  function edit(id: number) {
    if (isDesktop.value) composerDialog.show(id)
    else void router.push(`/posts/${id}/edit`)
  }

  return { edit }
}
