<script setup lang="ts">
  import { Inline, Stack, Text } from '@hina-ui/vue'
  import type { EditorDocument } from '@hikarinagi/editor-schema'
  import { COMMENT_THREAD_KEY } from '~/features/comment/useThread'
  import { COMMENT_DETAIL_ACTIONS_KEY } from '~/features/comment/detailBar'
  import { useLike, useLikeView } from '~/features/interaction/useLike'
  import type { CommentEmojiSets, CommentSummaries } from '~/features/comment/comment'
  import type { MediaValue } from '~/components/media-library/types'

  defineOptions({ name: 'CommentMobileBar' })

  // 只在 CommentSection(provide thread)内、且页面 provide 了动作上下文时渲染，故断言非空
  const actions = inject(COMMENT_DETAIL_ACTIONS_KEY)!
  const thread = inject(COMMENT_THREAD_KEY)!
  const { emojiSets, posting, replyTarget, postRoot, postReply, setReplyTarget } = thread

  const { toggle, busy } = useLike(actions.like.kind)
  const view = useLikeView(actions.like.kind, actions.like.id, () => ({
    like_count: actions.like.count,
    liked: actions.like.liked,
  }))

  function like() {
    const parentId = actions.like.parentId
    void toggle(
      actions.like.id,
      parentId != null ? { parentId, liked: view.value.liked } : undefined,
    )
  }

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
  <Stack
    gap="none"
    class="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl backdrop-saturate-200 md:hidden"
  >
    <Stack v-if="expanded" gap="none" class="px-3 py-2.5">
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
    </Stack>

    <Inline v-else gap="none" align="center" :wrap="false" class="gap-1 px-3 py-2.5">
      <Button
        variant="soft"
        tone="neutral"
        pill
        class="mr-1 h-9! min-w-0 flex-1 justify-start px-4!"
        @click="expand"
      >
        <Text as="span" size="sm" tone="muted" truncate class="min-w-0">{{ placeholder }}</Text>
      </Button>
      <Button
        login-required
        variant="ghost"
        :tone="view.liked ? 'accent' : 'neutral'"
        :loading="busy"
        :disabled="busy"
        aria-label="赞"
        pill
        class="h-9! shrink-0 px-3!"
        @click="like"
      >
        <template #icon><InteractionLikeIcon :active="view.liked" /></template>
        {{ view.like_count }}
      </Button>
      <FavoriteToggle
        :id="actions.favorite.id"
        :type="actions.favorite.type"
        :initial-favorited="actions.favorite.favorited"
        variant="bar"
        :picker-title="actions.favorite.pickerTitle"
        pill
        class="size-9! shrink-0"
      />
      <ShareButton :to="actions.shareTo" pill class="size-9! shrink-0" />
    </Inline>
  </Stack>
</template>
