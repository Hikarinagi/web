import type { PageResult } from '@hikarinagi/shared'
import type { PaginatorPageInput } from '~/components/ui/paginator/types'

export function usePagedList<TPage extends PageResult<unknown>>(
  initial: TPage,
  load: (page: number) => Promise<TPage>,
) {
  const list = shallowRef<TPage>(initial)
  const pending = ref(false)
  let requestSeq = 0

  async function loadPage(input: PaginatorPageInput) {
    const page = typeof input === 'number' ? input : input.page
    const ready = typeof input === 'number' ? undefined : input.ready
    const seq = ++requestSeq
    pending.value = true
    try {
      const next = await load(page)
      await ready
      if (seq === requestSeq) list.value = next
    } finally {
      if (seq === requestSeq) pending.value = false
    }
  }

  return { list, pending, loadPage }
}
