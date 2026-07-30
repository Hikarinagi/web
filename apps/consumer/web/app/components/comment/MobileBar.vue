<script setup lang="ts">
  import type { EditorDocument } from '@hikarinagi/editor-schema'
  import { COMMENT_THREAD_KEY } from '~/features/comment/useThread'
  import { COMMENT_DETAIL_ACTIONS_KEY } from '~/features/comment/detailBar'
  import { useLike, useLikeView } from '~/features/interaction/useLike'
  import type { CommentEmojiSets, CommentSummaries } from '~/features/comment/comment'
  import type { MediaValue } from '~/components/media-library/types'

  defineOptions({ name: 'CommentMobileBar' })

  // 只在 CommentSection(provide thread)内、且页面 provide 了动作上下文时渲染,故断言非空
  const actions = inject(COMMENT_DETAIL_ACTIONS_KEY)!
  const thread = inject(COMMENT_THREAD_KEY)!
  const { emojiSets, posting, replyTarget, postRoot, postReply, setReplyTarget } = thread

  const { toggle, busy } = useLike(actions.type)
  const view = useLikeView(actions.type, actions.id, () => ({
    like_count: actions.likeCount,
    liked: actions.liked,
  }))

  const expanded = ref(false)
  const composerRef = ref<{ focus: () => void; reset: () => void }>()
  const replyToName = computed(() => {
    const a = replyTarget.value?.author
    return a ? displayName(a) : null
  })
  const placeholder = computed(() =>
    replyToName.value ? `回复 @${replyToName.value}…` : '写下你的评论…',
  )

  async function expand() {
    expanded.value = true
    await nextTick()
    composerRef.value?.focus()
  }
  function collapse() {
    expanded.value = false
    setReplyTarget(null)
  }
  async function onSubmit(
    json: EditorDocument,
    sets: CommentEmojiSets,
    atts: MediaValue[],
    summaries: CommentSummaries,
  ) {
    const ok = replyTarget.value
      ? await postReply(json, sets, atts, summaries)
      : await postRoot(json, sets, atts, summaries)
    if (ok) {
      composerRef.value?.reset()
      collapse()
    }
  }

  // 在评论列表点「回复」会设 replyTarget → 自动展开底栏 composer
  watch(replyTarget, target => {
    if (target) void expand()
  })
</script>

<template>
  <div
    class="fixed inset-x-0 bottom-0 z-40 border-t border-surface bg-surface-0/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl backdrop-saturate-[1.8] md:hidden dark:bg-surface-950/90"
  >
    <div v-if="expanded" class="px-3 py-2.5">
      <CommentComposer
        ref="composerRef"
        collapsible
        :reply-to-name="replyToName"
        :placeholder="placeholder"
        :emoji-sets="emojiSets"
        :submitting="posting"
        @submit="onSubmit"
        @cancel="collapse"
      />
    </div>

    <div v-else class="flex items-center gap-1 px-3 py-2.5">
      <button
        type="button"
        class="mr-1 h-9 min-w-0 flex-1 truncate rounded-full bg-surface-100 px-4 text-left text-sm text-muted-color transition-colors hover:bg-surface-200 dark:bg-surface-800 dark:hover:bg-surface-700"
        @click="expand"
      >
        {{ placeholder }}
      </button>
      <Button
        login-required
        text
        :severity="view.liked ? undefined : 'secondary'"
        :loading="busy"
        :disabled="busy"
        :label="view.like_count.toString()"
        aria-label="赞"
        class="h-9! shrink-0 gap-1! rounded-full! px-3!"
        @click="toggle(actions.id)"
      >
        <template #icon><InteractionLikeIcon :active="view.liked" /></template>
      </Button>
      <FavoriteToggle
        :id="actions.id"
        :type="actions.type"
        :initial-favorited="actions.favorited"
        variant="bar"
        :picker-title="actions.pickerTitle"
        class="size-9! shrink-0 rounded-full!"
      />
      <ShareButton
        text
        severity="secondary"
        :to="`/${actions.type}s/${actions.id}`"
        class="size-9! shrink-0 rounded-full!"
      />
    </div>
  </div>
</template>
