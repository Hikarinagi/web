<script setup lang="ts">
  import { Empty, Heading, Inline, SegmentedControl, Stack, Text } from '@hina-ui/vue'
  import { AnimatePresence, motion } from 'motion-v'
  import type { ComponentPublicInstance } from 'vue'
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

  const sortTabs: { value: CommentSort; label: string }[] = [
    { value: 'hot', label: '热门' },
    { value: 'time_desc', label: '最新' },
  ]

  const sectionRef = ref<ComponentPublicInstance>()
  const topRef = ref<ComponentPublicInstance>()
  const listRef = ref<ComponentPublicInstance>()

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
    if (scroll) unrefElement(sectionRef)?.scrollIntoView({ block: 'start', behavior: 'smooth' })
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
  <Stack
    :id="COMMENT_SECTION_ID"
    ref="sectionRef"
    as="section"
    gap="none"
    :class="
      cn(
        'scroll-mt-[calc(var(--app-header-height)+1rem)] border-t border-line pt-8',
        detailActions && 'max-md:pb-[calc(4rem+env(safe-area-inset-bottom))]',
      )
    "
  >
    <Inline justify="between" :wrap="false" class="mb-5">
      <Heading :level="2" size="xl">
        评论
        <Text as="span" tone="muted">{{ total }}</Text>
      </Heading>
      <SegmentedControl
        v-if="allowComment"
        :model-value="sort"
        :options="sortTabs"
        size="sm"
        @update:model-value="value => setSort(value as CommentSort)"
      />
    </Inline>

    <Empty v-if="!allowComment" title="评论已关闭" />

    <template v-else>
      <Stack ref="topRef" gap="none">
        <CommentComposer
          ref="rootComposer"
          collapsible
          :emoji-sets="emojiSets"
          :submitting="posting"
          :overlay-enabled="!showDock && editingId === null"
          class="mb-6"
          @submit="onRoot"
        />
      </Stack>

      <Stack ref="listRef" gap="none">
        <CommentList :author-id="authorId" />
      </Stack>

      <AnimatePresence>
        <motion.div
          v-if="showDock"
          key="dock"
          :initial="{ y: '100%' }"
          :animate="{ y: '0%' }"
          :exit="{ y: '100%' }"
          :transition="TRANSITION"
          :class="
            cn(
              'sticky bottom-0 z-10 mt-6 -ml-3 border-t border-line bg-canvas py-4 pl-3',
              detailActions && 'max-md:hidden',
            )
          "
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
  </Stack>
</template>
