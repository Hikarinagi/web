<script setup lang="ts">
  import { AnimatePresence, motion } from 'motion-v'
  import type { EditorDocument } from '@hikarinagi/editor-schema'
  import { COMMENT_THREAD_KEY, useCommentThread } from '~/features/comment/useThread'
  import { COMMENT_DETAIL_ACTIONS_KEY } from '~/features/comment/detailBar'
  import {
    COMMENT_FOCUS_EVENT,
    COMMENT_SECTION_HASH,
    COMMENT_SECTION_ID,
    commentFocusId,
  } from '~/features/comment/comment'
  import type {
    CommentEmojiSets,
    CommentList,
    CommentSort,
    CommentSummaries,
    CommentTargetType,
  } from '~/features/comment/comment'
  import type { MediaValue } from '~/components/media-library/types'
  import { TRANSITION } from '~/lib/motion'

  defineOptions({ name: 'CommentSection' })

  const props = withDefaults(
    defineProps<{
      targetType: CommentTargetType
      targetId: number
      initial: CommentList | null
      authorId?: number | null
      allowComment?: boolean
    }>(),
    { authorId: null, allowComment: true },
  )

  const route = useRoute()
  const focusId = commentFocusId(route.query.comment)

  const thread = useCommentThread({
    targetType: props.targetType,
    targetId: props.targetId,
    initial: props.initial,
    initialSort: focusId != null ? 'time_desc' : 'hot',
  })
  provide(COMMENT_THREAD_KEY, thread)
  // 详情页提供了互动上下文 → 移动端用 CommentMobileBar(composer + 赞/收藏/分享)取代 sticky dock
  const detailActions = inject(COMMENT_DETAIL_ACTIONS_KEY, null)

  const {
    total,
    sort,
    posting,
    emojiSets,
    replyTarget,
    editingId,
    setSort,
    postRoot,
    postReply,
    setReplyTarget,
  } = thread

  const sortTabs: { key: CommentSort; label: string }[] = [
    { key: 'hot', label: '热门' },
    { key: 'time_desc', label: '最新' },
  ]

  const sectionRef = ref<HTMLElement>()
  const topRef = ref<HTMLElement>()
  const listRef = ref<HTMLElement>()

  const topAbove = ref(false)
  useIntersectionObserver(topRef, entries => {
    const e = entries.reduce((a, b) => (b.time >= a.time ? b : a))
    topAbove.value = e.boundingClientRect.bottom <= (e.rootBounds?.top ?? 0)
  })

  const { height: listHeight } = useElementSize(listRef)
  const { height: viewportHeight } = useWindowSize()
  const inComments = refDebounced(
    computed(() => topAbove.value && listHeight.value > viewportHeight.value),
    120,
  )
  const showDock = computed(() => inComments.value || replyTarget.value !== null)

  const replyToName = computed(() => {
    const a = replyTarget.value?.author
    return a ? displayName(a) : null
  })
  const dockPlaceholder = computed(() =>
    replyToName.value ? `回复 @${replyToName.value}…` : '写下你的评论…',
  )

  const rootComposer = ref<{ focus: () => void; reset: () => void }>()
  const dockRef = ref<{ focus: () => void; reset: () => void }>()

  async function focusRoot(scroll: boolean) {
    if (!props.allowComment) return
    setReplyTarget(null)
    if (scroll) sectionRef.value?.scrollIntoView({ block: 'start', behavior: 'smooth' })
    await nextTick()
    rootComposer.value?.focus()
  }

  function handleHash(hash: string) {
    if (hash === COMMENT_SECTION_HASH) void focusRoot(true)
  }

  function highlightComment(id: number) {
    thread.focusedId.value = id
    window.setTimeout(() => {
      if (thread.focusedId.value === id) thread.focusedId.value = null
    }, 2600)
  }

  onMounted(() => {
    if (focusId != null) highlightComment(focusId)
    else handleHash(route.hash)
  })
  watch(() => route.hash, handleHash)
  if (import.meta.client) {
    useEventListener(window, COMMENT_FOCUS_EVENT, () => void focusRoot(true))
  }

  async function onRoot(
    json: EditorDocument,
    sets: CommentEmojiSets,
    atts: MediaValue[],
    summaries: CommentSummaries,
  ) {
    if (await postRoot(json, sets, atts, summaries)) rootComposer.value?.reset()
  }

  async function onDock(
    json: EditorDocument,
    sets: CommentEmojiSets,
    atts: MediaValue[],
    summaries: CommentSummaries,
  ) {
    if (replyTarget.value) {
      if (await postReply(json, sets, atts, summaries)) dockRef.value?.reset()
    } else if (await postRoot(json, sets, atts, summaries)) {
      dockRef.value?.reset()
    }
  }
</script>

<template>
  <section
    :id="COMMENT_SECTION_ID"
    ref="sectionRef"
    class="scroll-mt-[calc(var(--app-header-height)+1rem)] border-t border-surface-200 pt-8 dark:border-surface-800"
    :class="detailActions ? 'max-md:pb-[calc(4rem+env(safe-area-inset-bottom))]' : null"
  >
    <div class="mb-5 flex items-center justify-between">
      <h2 class="text-xl font-bold text-color">
        评论
        <span class="text-muted-color">{{ total }}</span>
      </h2>
      <div v-if="allowComment" class="flex items-center gap-1">
        <Button
          v-for="tab in sortTabs"
          :key="tab.key"
          unstyled
          class="inline-flex items-center justify-center rounded-full px-3 py-1 text-sm transition-colors"
          :class="
            sort === tab.key
              ? 'bg-hikari-primary-50 font-medium text-hikari-primary-700 dark:bg-hikari-primary-950 dark:text-hikari-primary-300'
              : 'text-muted-color hover:text-color'
          "
          @click="setSort(tab.key)"
        >
          {{ tab.label }}
        </Button>
      </div>
    </div>

    <p
      v-if="!allowComment"
      class="rounded-xl bg-surface-50 py-6 text-center text-sm text-muted-color dark:bg-surface-900"
    >
      评论已关闭
    </p>

    <template v-else>
      <div ref="topRef">
        <CommentComposer
          ref="rootComposer"
          collapsible
          :emoji-sets="emojiSets"
          :submitting="posting"
          :overlay-enabled="!showDock && editingId === null"
          class="mb-6"
          @submit="onRoot"
        />
      </div>

      <div ref="listRef">
        <CommentList :author-id="authorId" />
      </div>

      <AnimatePresence>
        <motion.div
          v-if="showDock"
          key="dock"
          :initial="{ y: '100%' }"
          :animate="{ y: '0%' }"
          :exit="{ y: '100%' }"
          :transition="TRANSITION"
          class="sticky bottom-0 z-10 mt-6 border-t border-surface-200 bg-surface-0 py-4 shadow-[0_-6px_20px_-20px_rgba(15,23,41,0.16)] dark:border-surface-700 dark:bg-surface-950"
          :class="detailActions ? 'max-md:hidden' : null"
        >
          <CommentComposer
            ref="dockRef"
            collapsible
            :reply-to-name="replyToName"
            :placeholder="dockPlaceholder"
            :emoji-sets="emojiSets"
            :submitting="posting"
            :overlay-enabled="editingId === null"
            @submit="onDock"
            @cancel="setReplyTarget(null)"
          />
        </motion.div>
      </AnimatePresence>
      <CommentMobileBar v-if="detailActions" />
    </template>
  </section>
</template>
