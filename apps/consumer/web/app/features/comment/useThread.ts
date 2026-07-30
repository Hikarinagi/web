import type { InjectionKey } from 'vue'
import { EDITOR_SCHEMA_VERSION, type EditorDocument } from '@hikarinagi/editor-schema'
import {
  COMMENT_PAGE_SIZE,
  mergeEmojiSets,
  mergeSummaries,
  type CommentEmojiSets,
  type CommentItem,
  type CommentList,
  type CommentNode,
  type CommentSort,
  type CommentSummaries,
  type CommentTargetType,
} from './comment'
import type { MediaValue } from '~/components/media-library/types'

interface ThreadOptions {
  targetType: CommentTargetType
  targetId: number
  initial: CommentList | null
  initialSort?: CommentSort
}

export function useCommentThread(opts: ThreadOptions) {
  const { targetType, targetId } = opts

  const items = ref<CommentItem[]>([...(opts.initial?.page.items ?? [])])
  const total = ref(opts.initial?.total ?? 0)
  const topPage = ref(opts.initial?.page.meta.page ?? 1)
  const bottomPage = ref(opts.initial?.page.meta.page ?? 1)
  const totalPages = ref(opts.initial?.page.meta.total_pages ?? 1)
  const sort = ref<CommentSort>(opts.initialSort ?? 'hot')
  const loading = ref(false)
  const posting = ref(false)

  const summaries = ref<CommentSummaries>(opts.initial?.entity_summaries ?? emptySummaries())
  const emojiSets = ref<CommentEmojiSets>(opts.initial?.emoji_sets ?? [])

  const repliesLoading = ref(new Set<number>())
  const expandedIds = ref(new Set<number>())
  const replyPreviewCounts = ref(new Map<number, number>())
  const voting = ref(new Map<number, 'like' | 'dislike'>())
  const replyTarget = ref<CommentNode | CommentItem | null>(null)
  const editingId = ref<number | null>(null)
  const threadId = ref<number | null>(opts.initial?.thread_id ?? null)
  const focusedId = ref<number | null>(null)

  const hasMoreUp = computed(() => topPage.value > 1)
  const hasMoreDown = computed(() => bottomPage.value < totalPages.value)

  function absorb(s: CommentSummaries, e: CommentEmojiSets) {
    summaries.value = mergeSummaries(summaries.value, s)
    emojiSets.value = mergeEmojiSets(emojiSets.value, e)
  }

  function findInList(id: number): CommentItem | CommentNode | null {
    for (const item of items.value) {
      if (item.id === id) return item
      const child = item.children.find(c => c.id === id)
      if (child) return child
    }
    return null
  }

  async function fetchPage(target: number, mode: 'append' | 'prepend' | 'replace') {
    if (loading.value) return
    loading.value = true
    try {
      const res = await hikariRequest('/api/v3/comments', {
        query: {
          target_type: targetType,
          target_id: targetId,
          page: target,
          page_size: COMMENT_PAGE_SIZE,
          sort: sort.value,
        },
      })
      const known = new Set(items.value.map(i => i.id))
      const fresh = res.page.items.filter(i => !known.has(i.id))
      if (mode === 'replace') {
        items.value = [...res.page.items]
        topPage.value = res.page.meta.page
        bottomPage.value = res.page.meta.page
      } else if (mode === 'prepend') {
        items.value = [...fresh, ...items.value]
        topPage.value = target
      } else {
        items.value = [...items.value, ...fresh]
        bottomPage.value = target
      }
      totalPages.value = res.page.meta.total_pages
      total.value = res.total
      threadId.value = res.thread_id
      absorb(res.entity_summaries, res.emoji_sets)
    } finally {
      loading.value = false
    }
  }

  function setSort(next: CommentSort) {
    if (next === sort.value || loading.value) return
    sort.value = next
    editingId.value = null
    expandedIds.value.clear()
    replyPreviewCounts.value.clear()
    void fetchPage(1, 'replace')
  }

  function loadMoreDown() {
    if (loading.value || !hasMoreDown.value) return
    void fetchPage(bottomPage.value + 1, 'append')
  }

  function loadMoreUp() {
    if (loading.value || !hasMoreUp.value) return
    return fetchPage(topPage.value - 1, 'prepend')
  }

  async function postRoot(
    content_json: EditorDocument,
    docEmojiSets: CommentEmojiSets = [],
    attachments: MediaValue[] = [],
    docSummaries: CommentSummaries = emptySummaries(),
  ) {
    posting.value = true
    try {
      const created = await hikariRequest<'/api/v3/comments', 'post'>('/api/v3/comments', {
        method: 'post',
        body: {
          target_type: targetType,
          target_id: targetId,
          content_json: content_json as unknown as Record<string, unknown>,
          client_schema_version: EDITOR_SCHEMA_VERSION,
          attachments: attachments.map((m, i) => ({ media_asset_id: m.id, order: i })),
        },
      })
      absorb(docSummaries, docEmojiSets)
      items.value = [{ ...created, children: [], child_total: 0 }, ...items.value]
      total.value += 1
      return true
    } finally {
      posting.value = false
    }
  }

  async function postReply(
    content_json: EditorDocument,
    docEmojiSets: CommentEmojiSets = [],
    attachments: MediaValue[] = [],
    docSummaries: CommentSummaries = emptySummaries(),
  ) {
    const t = replyTarget.value
    if (!t) return false
    const isTopLevel = t.parent_id === null
    const parentId = isTopLevel ? t.id : t.parent_id!
    const replyToCommentId = isTopLevel ? null : t.id
    posting.value = true
    try {
      const created = await hikariRequest<'/api/v3/comments', 'post'>('/api/v3/comments', {
        method: 'post',
        body: {
          target_type: targetType,
          target_id: targetId,
          content_json: content_json as unknown as Record<string, unknown>,
          client_schema_version: EDITOR_SCHEMA_VERSION,
          parent_id: parentId,
          reply_to_comment_id: replyToCommentId,
          attachments: attachments.map((m, i) => ({ media_asset_id: m.id, order: i })),
        },
      })
      absorb(docSummaries, docEmojiSets)
      const parent = items.value.find(i => i.id === parentId)
      if (parent) {
        parent.children = [...parent.children, created]
        parent.child_total += 1
      }
      total.value += 1
      replyTarget.value = null
      return true
    } finally {
      posting.value = false
    }
  }

  async function editComment(
    id: number,
    content_json: EditorDocument,
    docEmojiSets: CommentEmojiSets = [],
    attachments: MediaValue[] = [],
    docSummaries: CommentSummaries = emptySummaries(),
  ) {
    posting.value = true
    try {
      const updated = await hikariRequest<'/api/v3/comments/{id}', 'patch'>(
        '/api/v3/comments/{id}',
        {
          method: 'patch',
          path: { id },
          body: {
            content_json: content_json as unknown as Record<string, unknown>,
            client_schema_version: EDITOR_SCHEMA_VERSION,
            attachments: attachments.map((m, i) => ({ media_asset_id: m.id, order: i })),
          },
        },
      )
      absorb(docSummaries, docEmojiSets)
      const node = findInList(id)
      if (node) {
        node.content_json = updated.content_json
        node.content_meta = updated.content_meta
        node.editor_schema_version = updated.editor_schema_version
        node.is_edited = updated.is_edited
        node.can_edit = updated.can_edit
        node.attachments = updated.attachments
      }
      editingId.value = null
      return true
    } finally {
      posting.value = false
    }
  }

  async function vote(comment: CommentItem | CommentNode, kind: 'like' | 'dislike') {
    const node = findInList(comment.id)
    if (!node || voting.value.has(node.id)) return
    const current = node.my_value
    const next: -1 | 0 | 1 = kind === 'like' ? (current === 1 ? 0 : 1) : current === -1 ? 0 : -1
    voting.value.set(node.id, kind)
    try {
      const res = await hikariRequest<'/api/v3/comments/{id}/vote', 'post'>(
        '/api/v3/comments/{id}/vote',
        { method: 'post', path: { id: node.id }, body: { value: next } },
      )
      node.like_count = res.like_count
      node.dislike_count = res.dislike_count
      node.my_value = res.my_value
    } catch {
      /* empty */
    } finally {
      voting.value.delete(node.id)
    }
  }

  async function remove(comment: CommentItem | CommentNode) {
    await hikariRequest<'/api/v3/comments/{id}', 'delete'>('/api/v3/comments/{id}', {
      method: 'delete',
      path: { id: comment.id },
    })
    const top = items.value.find(i => i.id === comment.id)
    if (top && top.child_total === 0) {
      // 顶层无子 → 列表移除
      items.value = items.value.filter(i => i.id !== comment.id)
    } else {
      // tombstone:顶层有子保留承载回复;回复就地标记,由 visibleChildren 过滤隐藏
      const node = findInList(comment.id)
      if (node) {
        node.is_deleted = true
        node.author = null
        node.content_json = null
        node.attachments = []
      }
    }
    // 「评论 N」= 未删评论总数(含回复)→ 任意评论(顶层 / 回复)删除都 -1
    total.value = Math.max(0, total.value - 1)
  }

  function resort() {
    items.value = [...items.value].sort((a, b) => {
      if (a.is_pinned !== b.is_pinned) return a.is_pinned ? -1 : 1
      if (sort.value === 'hot' && b.like_count !== a.like_count) return b.like_count - a.like_count
      return b.created_at.localeCompare(a.created_at)
    })
  }

  async function togglePin(comment: CommentItem | CommentNode) {
    const node = findInList(comment.id)
    if (!node) return
    const next = !node.is_pinned
    node.is_pinned = next
    resort()
    try {
      if (next) {
        await hikariRequest<'/api/v3/comments/{id}/pin', 'post'>('/api/v3/comments/{id}/pin', {
          method: 'post',
          path: { id: node.id },
        })
      } else {
        await hikariRequest<'/api/v3/comments/{id}/unpin', 'post'>('/api/v3/comments/{id}/unpin', {
          method: 'post',
          path: { id: node.id },
        })
      }
    } catch {
      node.is_pinned = !next
      resort()
    }
  }

  async function expandReplies(item: CommentItem) {
    if (repliesLoading.value.has(item.id)) return
    // 首次展开时记下预览基数(后端 list 预取的 children 条数),收起时切回到此
    if (!expandedIds.value.has(item.id)) {
      replyPreviewCounts.value.set(item.id, item.children.length)
    }
    repliesLoading.value.add(item.id)
    expandedIds.value.add(item.id)
    try {
      const loaded = item.children.length
      const nextPage = Math.floor(loaded / COMMENT_PAGE_SIZE) + 1
      const res = await hikariRequest('/api/v3/comments/{id}/replies', {
        path: { id: item.id },
        query: { page: nextPage, page_size: COMMENT_PAGE_SIZE },
      })
      const known = new Set(item.children.map(c => c.id))
      item.children = [...item.children, ...res.page.items.filter(c => !known.has(c.id))]
      item.child_total = res.page.meta.total_items
      absorb(res.entity_summaries, res.emoji_sets)
    } finally {
      repliesLoading.value.delete(item.id)
    }
  }

  function collapseReplies(id: number) {
    const item = items.value.find(i => i.id === id)
    if (!item) return
    // 展开是 append,切回预览基数即还原;child_total 不变,收起后展开按钮自动回归
    item.children = item.children.slice(0, replyPreviewCounts.value.get(id) ?? 0)
    expandedIds.value.delete(id)
  }

  function setReplyTarget(node: CommentNode | CommentItem | null) {
    if (node !== null) editingId.value = null
    replyTarget.value = node
  }

  function setEditing(id: number | null) {
    if (id !== null) replyTarget.value = null
    editingId.value = id
  }

  return {
    items,
    total,
    sort,
    loading,
    posting,
    hasMoreUp,
    hasMoreDown,
    summaries,
    emojiSets,
    repliesLoading,
    expandedIds,
    voting,
    replyTarget,
    editingId,
    focusedId,
    setSort,
    loadMoreUp,
    loadMoreDown,
    postRoot,
    postReply,
    editComment,
    vote,
    remove,
    togglePin,
    expandReplies,
    collapseReplies,
    setReplyTarget,
    setEditing,
  }
}

function emptySummaries(): CommentSummaries {
  return {
    galgames: [],
    light_novels: [],
    light_novel_volumes: [],
    mangas: [],
    persons: [],
    producers: [],
    characters: [],
    articles: [],
    posts: [],
    galgame_rates: [],
    light_novel_rates: [],
    manga_rates: [],
    mention_users: [],
    comments: [],
    polls: [],
  }
}

export type CommentThread = ReturnType<typeof useCommentThread>
export const COMMENT_THREAD_KEY: InjectionKey<CommentThread> = Symbol('comment-thread')
