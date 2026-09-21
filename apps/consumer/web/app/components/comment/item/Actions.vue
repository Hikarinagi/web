<script setup lang="ts">
  import { DropdownMenu, DropdownMenuItem, Inline } from '@hina-ui/vue'
  import { CornerUpLeft, Ellipsis, Flag, Pencil, Pin, Trash2 } from '@lucide/vue'
  import type { Component } from 'vue'
  import { COMMENT_THREAD_KEY } from '~/features/comment/useThread'
  import type { CommentItem, CommentNode } from '~/features/comment/comment'
  import type { ReportBody } from '~/features/report/report'

  defineOptions({ name: 'CommentItemActions' })

  interface ActionMenuItem {
    label: string
    icon: Component
    danger?: boolean
    loginRequired?: boolean
    action: () => void
  }

  const props = withDefaults(
    defineProps<{
      comment: CommentItem | CommentNode
      authorId?: number | null
      isReply?: boolean
    }>(),
    { authorId: null, isReply: false },
  )

  const thread = inject(COMMENT_THREAD_KEY)!
  const auth = useAuthStore()
  const { confirm } = useHikariConfirm()
  const { requireLogin } = useAuthGate()
  const reportVisible = ref(false)

  const isMine = computed(() => auth.user?.id != null && props.comment.author?.id === auth.user.id)
  const canPin = computed(() => {
    const role = auth.user?.role
    if (role === 'ADMIN' || role === 'SUPER_ADMIN') return true
    return props.authorId != null && auth.user?.id === props.authorId
  })
  const myVote = computed(() => props.comment.my_value)
  const votingKind = computed(() => thread.voting.value.get(props.comment.id) ?? null)
  const isVoting = computed(() => votingKind.value !== null)

  const menuItems = computed<ActionMenuItem[]>(() => {
    const items: ActionMenuItem[] = []
    if (canPin.value) {
      items.push({
        label: props.comment.is_pinned ? '取消置顶' : '置顶',
        icon: Pin,
        action: confirmTogglePin,
      })
    }
    if (isMine.value) {
      if (props.comment.can_edit) {
        items.push({
          label: '编辑',
          icon: Pencil,
          action: () => thread.setEditing(props.comment.id),
        })
      }
      items.push({ label: '删除', icon: Trash2, danger: true, action: confirmDelete })
    } else {
      items.push({ label: '举报', icon: Flag, loginRequired: true, action: openReport })
    }
    return items
  })

  function confirmTogglePin() {
    const pinned = props.comment.is_pinned
    confirm({
      title: pinned ? '取消置顶' : '置顶评论',
      description: pinned
        ? '确定取消置顶这条评论吗？'
        : '确定置顶这条评论吗？置顶后会显示在评论区顶部。',
      confirmText: pinned ? '取消置顶' : '置顶',
      cancelText: '取消',
      onConfirm: () => {
        thread.togglePin(props.comment)
      },
    })
  }

  function confirmDelete() {
    confirm({
      title: '删除评论',
      description: '删除后无法恢复，确定删除这条评论吗？',
      confirmText: '删除',
      cancelText: '取消',
      tone: 'danger',
      onConfirm: () => {
        thread.remove(props.comment)
      },
    })
  }

  function openReport() {
    reportVisible.value = true
  }

  async function submitReport(body: ReportBody) {
    await hikariRequest<'/api/v3/comments/{id}/report', 'post'>('/api/v3/comments/{id}/report', {
      method: 'post',
      path: { id: props.comment.id },
      body,
    })
  }
</script>

<template>
  <Inline gap="lg">
    <Button
      login-required
      variant="ghost"
      :tone="myVote === 1 ? 'accent' : 'neutral'"
      size="sm"
      :loading="votingKind === 'like'"
      :disabled="isVoting"
      aria-label="赞"
      @click="thread.vote(comment, 'like')"
    >
      <template #icon><InteractionLikeIcon :active="myVote === 1" /></template>
      {{ comment.like_count }}
    </Button>
    <Button
      login-required
      variant="ghost"
      :tone="myVote === -1 ? 'accent' : 'neutral'"
      size="sm"
      icon-only
      :loading="votingKind === 'dislike'"
      :disabled="isVoting"
      aria-label="踩"
      @click="thread.vote(comment, 'dislike')"
    >
      <template #icon><InteractionDislikeIcon :active="myVote === -1" /></template>
    </Button>
    <Button
      login-required
      variant="ghost"
      tone="neutral"
      size="sm"
      @click="thread.setReplyTarget(comment)"
    >
      <template #icon><CornerUpLeft /></template>
      回复
    </Button>

    <DropdownMenu v-if="!isReply" label="评论操作" align="end">
      <IconButton label="更多" :tooltip="false" size="sm" aria-haspopup="menu">
        <Ellipsis />
      </IconButton>

      <template #content>
        <DropdownMenuItem
          v-for="item in menuItems"
          :key="item.label"
          :tone="item.danger ? 'danger' : undefined"
          @select="item.loginRequired && !requireLogin() ? undefined : item.action()"
        >
          <template #icon>
            <component :is="item.icon" />
          </template>
          {{ item.label }}
        </DropdownMenuItem>
      </template>
    </DropdownMenu>
    <ReportDialog v-model:visible="reportVisible" title="举报评论" :submit="submitReport" />
  </Inline>
</template>
