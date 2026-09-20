import { breakpointsTailwind, useBreakpoints } from '@vueuse/core'
import type { ApiQuery } from '@hikarinagi/api-contract/v3'
import type { PaginatorPageInput } from '~/components/ui/paginator/types'
import { usePostComposerDialog } from '~/components/feed/composer/composables/usePostComposerDialog'
import { usePostOwnerActions } from '~/features/post/usePostOwnerActions'
import { useArticleOwnerActions } from '~/features/article/useArticleOwnerActions'
import {
  MANAGED_CONTENT_PAGE_SIZE,
  type ManagedContentItem,
  type ManagedContentPage,
  type ManagedStatusFilterKey,
} from './space'

type ManagedContentQuery = ApiQuery<'/api/v3/user/me/contents', 'get'>
type ManagedType = 'post' | 'article'

export function useManagedContent(initial: ManagedContentPage, type: ManagedType) {
  const router = useRouter()
  const confirm = useConfirm()
  const composerDialog = usePostComposerDialog()
  const postActions = usePostOwnerActions()
  const articleActions = useArticleOwnerActions()
  const isDesktop = useBreakpoints(breakpointsTailwind).greaterOrEqual('md')
  const list = ref<ManagedContentPage>(initial)
  const status = ref<ManagedStatusFilterKey>('all')
  const search = ref('')
  const updatedRange = ref<Date[] | null>(null)
  const page = ref(initial.meta.page)
  const pending = ref(false)
  let requestSeq = 0

  const hasFilters = computed(
    () => status.value !== 'all' || search.value.trim().length > 0 || !!updatedRange.value?.[0],
  )

  const query = computed<ManagedContentQuery>(() => {
    const [from, to] = updatedRange.value ?? []
    const end = to ? new Date(to) : null
    if (end) end.setHours(23, 59, 59, 999)

    return {
      type,
      page: page.value,
      page_size: MANAGED_CONTENT_PAGE_SIZE,
      ...(status.value !== 'all' ? { status: status.value } : {}),
      ...(search.value.trim() ? { search: search.value.trim() } : {}),
      ...(from ? { updated_from: from.toISOString() } : {}),
      ...(end ? { updated_to: end.toISOString() } : {}),
    }
  })

  async function load(ready?: Promise<void>) {
    const seq = ++requestSeq
    pending.value = true
    try {
      const next = await hikariRequest('/api/v3/user/me/contents', { query: query.value })
      await ready
      if (seq === requestSeq) list.value = next
    } finally {
      if (seq === requestSeq) pending.value = false
    }
  }

  function reset() {
    status.value = 'all'
    search.value = ''
    updatedRange.value = null
    page.value = 1
  }

  function loadPage(input: PaginatorPageInput) {
    const nextPage = typeof input === 'number' ? input : input.page
    page.value = nextPage
    void load(typeof input === 'number' ? undefined : input.ready)
  }

  function create() {
    if (type === 'article') void router.push('/articles/new')
    else if (isDesktop.value) composerDialog.show()
    else void router.push('/posts/new')
  }

  function edit(item: ManagedContentItem) {
    if (item.content_type === 'post') postActions.edit(item.id)
    else articleActions.edit(item.id, item.status)
  }

  function remove(item: ManagedContentItem) {
    confirm.require({
      group: 'app-shell',
      header: '删除',
      message: `确定删除《${item.title || '未命名'}》吗？删除后无法恢复。`,
      acceptLabel: '删除',
      rejectLabel: '取消',
      onAccept: async ({ close }) => {
        close()
        try {
          if (item.content_type === 'post') {
            await hikariRequest('/api/v3/posts/{id}', { method: 'delete', path: { id: item.id } })
          } else {
            await hikariRequest('/api/v3/articles/{id}', {
              method: 'delete',
              path: { id: item.id },
            })
          }
          if (list.value.items.length === 1 && page.value > 1) page.value -= 1
          await load()
        } catch {
          /* 全局错误提示已处理 */
        }
      },
    })
  }

  const debouncedLoad = useDebounceFn(() => {
    page.value = 1
    void load()
  }, 300)

  watch(
    [status, updatedRange],
    () => {
      page.value = 1
      void load()
    },
    { deep: true },
  )
  watch(search, () => debouncedLoad())
  watch(composerDialog.open, (open, was) => {
    if (was && !open) void load()
  })

  return {
    list,
    status,
    search,
    updatedRange,
    hasFilters,
    pending,
    create,
    edit,
    remove,
    reset,
    loadPage,
  }
}
