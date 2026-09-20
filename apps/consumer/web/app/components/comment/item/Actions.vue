<script setup lang="ts">
  import { CornerUpLeft, Ellipsis, Flag, Pencil, Pin, Trash2 } from '@lucide/vue'
  import type MenuType from 'primevue/menu'
  import type { MenuItem } from 'primevue/menuitem'
  import { COMMENT_THREAD_KEY } from '~/features/comment/useThread'
  import type { CommentItem, CommentNode } from '~/features/comment/comment'
  import type { ReportBody } from '~/features/report/report'

  defineOptions({ name: 'CommentItemActions' })

  interface ActionMenuItem extends MenuItem {
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
  const confirm = useConfirm()
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

  const menu = ref<InstanceType<typeof MenuType>>()
  const menuItems = computed<ActionMenuItem[]>(() => {
    const items: ActionMenuItem[] = []
    if (canPin.value) {
      items.push({
        label: props.comment.is_pinned ? '取消置顶' : '置顶',
        action: confirmTogglePin,
      })
    }
    if (isMine.value) {
      if (props.comment.can_edit) {
        items.push({
          label: '编辑',
          action: () => {
            menu.value?.hide()
            thread.setEditing(props.comment.id)
          },
        })
      }
      items.push({ label: '删除', action: confirmDelete })
    } else {
      items.push({ label: '举报', loginRequired: true, action: openReport })
    }
    return items
  })

  function confirmTogglePin() {
    menu.value?.hide()
    const pinned = props.comment.is_pinned
    confirm.require({
      group: 'app-shell',
      header: pinned ? '取消置顶' : '置顶评论',
      message: pinned
        ? '确定取消置顶这条评论吗？'
        : '确定置顶这条评论吗？置顶后会显示在评论区顶部。',
      acceptLabel: pinned ? '取消置顶' : '置顶',
      rejectLabel: '取消',
      onAccept: ({ close }: { close: () => void }) => {
        close()
        thread.togglePin(props.comment)
      },
    })
  }

  function confirmDelete() {
    menu.value?.hide()
    confirm.require({
      group: 'app-shell',
      header: '删除评论',
      message: '删除后无法恢复，确定删除这条评论吗？',
      acceptLabel: '删除',
      rejectLabel: '取消',
      onAccept: ({ close }: { close: () => void }) => {
        close()
        thread.remove(props.comment)
      },
    })
  }

  function openReport() {
    menu.value?.hide()
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
  <div class="flex items-center gap-5 text-muted-color">
    <Button
      login-required
      text
      size="small"
      :severity="myVote === 1 ? undefined : 'secondary'"
      :loading="votingKind === 'like'"
      :disabled="isVoting"
      :label="comment.like_count.toString()"
      class="-mx-2 -my-1 gap-1.5! px-2! py-1! hover:bg-transparent! active:bg-transparent!"
      :class="{ 'hover:text-color!': myVote !== 1 }"
      @click="thread.vote(comment, 'like')"
    >
      <template #icon><InteractionLikeIcon :active="myVote === 1" /></template>
    </Button>
    <Button
      login-required
      text
      size="small"
      :severity="myVote === -1 ? undefined : 'secondary'"
      :loading="votingKind === 'dislike'"
      :disabled="isVoting"
      class="-mx-2 -my-1 w-auto! px-2! py-1! hover:bg-transparent! active:bg-transparent!"
      :class="{ 'hover:text-color!': myVote !== -1 }"
      @click="thread.vote(comment, 'dislike')"
    >
      <template #icon><InteractionDislikeIcon :active="myVote === -1" /></template>
    </Button>
    <Button
      login-required
      text
      size="small"
      severity="secondary"
      label="回复"
      class="-mx-2 -my-1 gap-1.5! px-2! py-1! hover:bg-transparent! hover:text-color! active:bg-transparent!"
      @click="thread.setReplyTarget(comment)"
    >
      <template #icon><CornerUpLeft /></template>
    </Button>
    <Button
      v-if="!isReply"
      text
      size="small"
      severity="secondary"
      aria-label="更多"
      class="-mx-2 -my-1 w-auto! px-2! py-1! hover:bg-transparent! hover:text-color! active:bg-transparent!"
      @click="(e: MouseEvent) => menu?.toggle(e)"
    >
      <template #icon><Ellipsis /></template>
    </Button>
    <Menu v-if="!isReply" ref="menu" :model="menuItems" popup>
      <template #item="{ item }">
        <Button
          unstyled
          :login-required="item.loginRequired"
          class="flex w-full items-center gap-2 px-3 py-1.5 text-sm"
          :class="item.label === '删除' ? 'text-red-500' : 'text-color'"
          @click="item.action"
        >
          <Pencil v-if="item.label === '编辑'" class="size-4" />
          <Trash2 v-else-if="item.label === '删除'" class="size-4" />
          <Pin v-else-if="item.label === '置顶' || item.label === '取消置顶'" class="size-4" />
          <Flag v-else class="size-4" />
          {{ item.label }}
        </Button>
      </template>
    </Menu>
    <ReportDialog v-model:visible="reportVisible" title="举报评论" :submit="submitReport" />
  </div>
</template>
